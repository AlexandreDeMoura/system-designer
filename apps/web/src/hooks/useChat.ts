import { useState, useRef, useEffect, useCallback } from 'react'
import { trpc } from '../trpc'
import type { Decision } from '../types'
import type { Project } from '@sd/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface UseChatOptions {
  decision: Decision
  project?: Project | null
  onError?: (error: string) => void
}

export function useChat({ decision, project, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // RAF-based batching refs
  const tokenBufferRef = useRef('')
  const currentMessageIdRef = useRef<string | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const isStreamingRef = useRef(false)

  const chatMutation = trpc.chat.useMutation()

  // Flush buffered tokens to state - runs on animation frame
  const flushTokenBuffer = useCallback(() => {
    if (tokenBufferRef.current && currentMessageIdRef.current) {
      const bufferedContent = tokenBufferRef.current
      const messageId = currentMessageIdRef.current
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: msg.content + bufferedContent }
            : msg
        )
      )
      
      tokenBufferRef.current = ''
    }
    
    // Schedule next frame if still streaming
    if (isStreamingRef.current) {
      rafIdRef.current = requestAnimationFrame(flushTokenBuffer)
    }
  }, [])

  // Start RAF loop when streaming begins
  const startStreamingLoop = useCallback((messageId: string) => {
    currentMessageIdRef.current = messageId
    isStreamingRef.current = true
    tokenBufferRef.current = ''
    rafIdRef.current = requestAnimationFrame(flushTokenBuffer)
  }, [flushTokenBuffer])

  // Stop RAF loop when streaming ends
  const stopStreamingLoop = useCallback(() => {
    isStreamingRef.current = false
    
    // Final flush of any remaining tokens
    if (tokenBufferRef.current && currentMessageIdRef.current) {
      const bufferedContent = tokenBufferRef.current
      const messageId = currentMessageIdRef.current
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: msg.content + bufferedContent, isStreaming: false }
            : msg
        )
      )
    }
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    
    tokenBufferRef.current = ''
    currentMessageIdRef.current = null
  }, [])

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

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
    
    // Start the RAF-based streaming loop
    startStreamingLoop(assistantMessage.id)

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
        project: project ? { name: project.name, description: project.description } : undefined,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'text_delta' && chunk.content) {
          // Buffer tokens instead of immediately updating state
          // The RAF loop will flush these at 60fps
          tokenBufferRef.current += chunk.content
        } else if (chunk.type === 'error') {
          onError?.(chunk.error ?? 'An error occurred')
          stopStreamingLoop()
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== assistantMessage.id)
          )
        }
      }

      // Stop streaming loop and do final state update
      stopStreamingLoop()
      
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
      stopStreamingLoop()
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessage.id)
      )
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const clearMessages = () => {
    stopStreamingLoop()
    setMessages([])
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      stopStreamingLoop()
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
