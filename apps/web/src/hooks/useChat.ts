import { useState, useRef } from 'react'
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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setIsLoading(true)

    abortControllerRef.current = new AbortController()

    try {
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

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

      const stream = await chatMutation.mutateAsync({
        messages: apiMessages,
        decision: decisionContext,
      })

      let fullContent = ''

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
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessage.id)
      )
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
        )
      )
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    stopGeneration,
  }
}

