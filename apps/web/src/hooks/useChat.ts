import { useState, useRef, useEffect, useCallback } from 'react'
import { trpc } from '../trpc'
import type { Decision } from '../types'
import type { Project, ProjectDecision, ToolCall } from '@sd/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  systemAction?: {
    type: 'decision_saved'
    selectedOption: string
    success: boolean
  }
}

// Result returned when the AI saves a decision
export interface SaveDecisionResult {
  success: boolean
  message: string
  decision?: ProjectDecision
}

interface UseChatOptions {
  decision: Decision
  project?: Project | null
  onError?: (error: string) => void
  /** Called when the AI successfully saves a decision */
  onDecisionSaved?: (result: SaveDecisionResult) => void
}

export function useChat({ decision, project, onError, onDecisionSaved }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // RAF-based batching refs
  const tokenBufferRef = useRef('')
  const currentMessageIdRef = useRef<string | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const isStreamingRef = useRef(false)

  const chatMutation = trpc.chat.useMutation()
  const chatWithToolsMutation = trpc.chatWithTools.useMutation()

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

  // Handle tool calls from the LLM - add a system message to the chat
  const handleToolCall = useCallback((toolCall: ToolCall) => {
    if (toolCall.name === 'save_decision') {
      // The server has already executed the tool and attached the result
      const result = (toolCall.input as { __result?: SaveDecisionResult }).__result
      const selectedOption = (toolCall.input as { selected_option?: string }).selected_option
      
      if (result) {
        // Add a system message showing the decision was saved
        const systemMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: result.message,
          systemAction: {
            type: 'decision_saved',
            selectedOption: selectedOption ?? '',
            success: result.success,
          },
        }
        setMessages((prev) => [...prev, systemMessage])
        
        // Also notify the parent (for cache invalidation)
        onDecisionSaved?.(result)
      }
    }
  }, [onDecisionSaved])

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
      // Filter out system messages - they're local-only and shouldn't be sent to the API
      const apiMessages = [...messages, userMessage]
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
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

      // Choose which mutation to use based on project availability
      let stream: AsyncIterable<{ type: string; content?: string; error?: string; toolCall?: ToolCall }>
      
      if (project) {
        // Use tool-enabled mutation for authenticated users with a project
        stream = await chatWithToolsMutation.mutateAsync({
          messages: apiMessages,
          decision: decisionContext,
          project: { 
            id: project.id, 
            name: project.name, 
            description: project.description 
          },
        })
      } else {
        // Use regular mutation for unauthenticated users or no project
        stream = await chatMutation.mutateAsync({
          messages: apiMessages,
          decision: decisionContext,
        })
      }

      for await (const chunk of stream) {
        if (chunk.type === 'text_delta' && chunk.content) {
          // Buffer tokens instead of immediately updating state
          // The RAF loop will flush these at 60fps
          tokenBufferRef.current += chunk.content
        } else if (chunk.type === 'tool_use' && chunk.toolCall) {
          // Handle tool calls from the LLM
          handleToolCall(chunk.toolCall)
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
