import { useState, useCallback, useRef } from 'react'
import { trpc } from '../trpc'
import type { Decision } from '../types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface UseChatOptions {
  decision: Decision
  onError?: (error: string) => void
}

export function useChat({ decision, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const chatMutation = trpc.chat.useMutation()

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      // Create user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
      }

      // Create placeholder for assistant response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsLoading(true)

      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        // Build messages array for API (without IDs and streaming flag)
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

        // Prepare decision context for API
        const decisionContext = {
          id: decision.id,
          title: decision.title,
          description: decision.description,
          options: decision.options.map((opt) => ({
            name: opt.name,
            pros: opt.pros,
            cons: opt.cons,
            bestWhen: opt.bestWhen,
          })),
          questions: decision.questions,
        }

        // Use the streaming mutation
        const stream = await chatMutation.mutateAsync({
          messages: apiMessages,
          decision: decisionContext,
        })

        // Process the async generator stream
        let fullContent = ''
        
        // The stream is an async iterable
        for await (const chunk of stream) {
          if (chunk.type === 'text_delta' && chunk.content) {
            fullContent += chunk.content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: fullContent }
                  : msg
              )
            )
          } else if (chunk.type === 'error') {
            onError?.(chunk.error ?? 'An error occurred')
            // Remove the empty assistant message on error
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== assistantMessage.id)
            )
          }
        }

        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, isStreaming: false }
              : msg
          )
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to send message'
        onError?.(errorMessage)
        // Remove the empty assistant message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessage.id)
        )
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages, decision, isLoading, chatMutation, onError]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      // Mark the last message as not streaming
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
        )
      )
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    stopGeneration,
  }
}

