import { useState, useRef, useEffect } from 'react'
import { X, ArrowUp, Trash2, Square, Sparkles, User } from 'lucide-react'
import clsx from 'clsx'
import { useChat, type ChatMessage } from '../hooks/useChat'
import type { Decision } from '../types'

interface ChatModalProps {
  decision: Decision
  isOpen: boolean
  onClose: () => void
  categoryColor: string
}

export function ChatModal({ decision, isOpen, onClose, categoryColor }: ChatModalProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, isLoading, sendMessage, clearMessages, stopGeneration } = useChat({
    decision,
    onError: setError,
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setError(null)
      sendMessage(input)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!isOpen) return null

  const accentColors: Record<string, { gradient: string; text: string; bg: string; border: string }> = {
    blue: { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    cyan: { gradient: 'from-cyan-500 to-cyan-600', text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
    violet: { gradient: 'from-violet-500 to-violet-600', text: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
    emerald: { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    rose: { gradient: 'from-rose-500 to-rose-600', text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
    amber: { gradient: 'from-amber-500 to-amber-600', text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  }

  // Note: Using bg-linear-to-br for Tailwind v4 compatibility

  const accent = accentColors[categoryColor] ?? accentColors.blue

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className={clsx('flex items-center gap-3 px-5 py-4 border-b border-slate-700/50', accent.bg)}>
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center bg-linear-to-br', accent.gradient)}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-100 truncate">AI System Designer</h2>
            <p className="text-xs text-slate-400 truncate">{decision.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearMessages}
              className="cursor-pointer p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', accent.bg)}>
                <Sparkles className={clsx('w-8 h-8', accent.text)} />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Start a conversation</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Ask me anything about <span className={accent.text}>{decision.title}</span>. 
                I'll help you understand the tradeoffs and make the right choice for your project.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
                {[
                  "What's best for a small team?",
                  "Compare the top 2 options",
                  "What should I consider first?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion)
                      inputRef.current?.focus()
                    }}
                    className={clsx(
                      'cursor-pointer px-3 py-1.5 text-xs rounded-full border transition-colors',
                      accent.border,
                      accent.text,
                      'hover:bg-slate-800/50'
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              accent={accent}
            />
          ))}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50 bg-slate-800/30">
          <div className={clsx('relative rounded-xl border', accent.border, 'bg-slate-800/50')}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this decision..."
              rows={1}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 px-4 py-3 pr-14 resize-none focus:outline-none text-sm"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                title="Stop"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={clsx(
                  'cursor-pointer absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                  input.trim()
                    ? clsx('bg-linear-to-r', accent.gradient, 'text-white hover:opacity-90')
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                )}
                title="Send"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  accent: { gradient: string; text: string; bg: string; border: string }
}

function MessageBubble({ message, accent }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          isUser ? 'bg-slate-700' : clsx('bg-linear-to-br', accent.gradient)
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-slate-300" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message */}
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-slate-700/50 text-slate-200'
            : clsx(accent.bg, accent.border, 'border')
        )}
      >
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content || (message.isStreaming && <StreamingCursor />)}
        </div>
        {message.isStreaming && message.content && (
          <StreamingCursor />
        )}
      </div>
    </div>
  )
}

function StreamingCursor() {
  return (
    <span className="inline-flex ml-0.5">
      <span className="w-2 h-4 bg-current opacity-70 animate-pulse rounded-sm" />
    </span>
  )
}

