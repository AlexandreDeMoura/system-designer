import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowUp, Trash2, Square, Sparkles, User } from 'lucide-react'
import clsx from 'clsx'
import { useChat, type ChatMessage } from '../hooks/useChat'
import { phaseColors, categoryColors } from '../theme'
import type { Decision } from '../types'

interface ChatModalProps {
  decision: Decision
  isOpen: boolean
  onClose: () => void
  categoryColor: string
  nudges: [string, string, string]
}

export function ChatModal({ decision, isOpen, onClose, categoryColor, nudges }: ChatModalProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, isLoading, sendMessage, clearMessages, stopGeneration } = useChat({
    decision,
    onError: setError,
  })

  // Auto-scroll to bottom when new messages arrive if the user is already there
  useEffect(() => {
    if (!isOpen || !shouldAutoScrollRef.current) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset auto-scroll when opening the modal
  useEffect(() => {
    if (!isOpen) return
    shouldAutoScrollRef.current = true
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return
    const bottomOffset = 8
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    shouldAutoScrollRef.current = distanceFromBottom <= bottomOffset
  }

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
  const phaseColor = decision.phase ? phaseColors[decision.phase] : null
  const catColor = categoryColors[categoryColor]

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-backdrop-in"
        onClick={onClose}
      />
      
      {/* Side-by-side container */}
      <div className="relative w-full max-w-6xl h-[85vh] flex flex-col lg:flex-row gap-4 lg:gap-6">
        
        {/* Chat Panel - Left */}
        <div className="relative flex-1 min-w-0 h-full flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-slide-in-left">
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
                className="cursor-pointer p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors lg:hidden"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-5 space-y-4"
          >
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
                  {nudges.map((suggestion) => (
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

        {/* Decision Card Panel - Right (hidden on mobile) */}
        <div className="hidden lg:flex w-[420px] shrink-0 flex-col rounded-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-slide-in-right">
          {/* Card Header */}
          <div className={clsx('flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-700/50', accent.bg)}>
            <div className="flex items-center gap-2">
              <span className={clsx('text-xs font-mono', catColor.text)}>{decision.id}</span>
              <h3 className="font-semibold text-slate-100 truncate">{decision.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scrollable Card Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Phase Badge */}
            {decision.phase && (
              <div className="mb-4">
                <span className={clsx('text-xs px-2 py-1 rounded-full border', phaseColor?.bg, phaseColor?.text, phaseColor?.border)}>
                  Phase {decision.phase}
                </span>
              </div>
            )}
            
            {/* Description */}
            <p className="text-sm text-slate-400 mb-6">{decision.description}</p>
            
            {/* Options */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                Options
              </h4>
              <div className="space-y-2">
                {decision.options.map((option, i) => (
                  <details key={i} className="group">
                    <summary className="option-row flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-800/50 list-none">
                      <span className={clsx('w-5 h-5 rounded flex items-center justify-center text-xs font-mono', catColor.bg, catColor.text)}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-200">{option.name}</span>
                      <svg className="w-4 h-4 ml-auto text-slate-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-2 ml-2 p-3 bg-slate-800/30 rounded-lg text-sm space-y-2">
                      <div>
                        <span className="text-emerald-400 text-xs uppercase tracking-wider">Pros:</span>
                        <ul className="text-slate-300 mt-1 space-y-1">
                          {option.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-400">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-rose-400 text-xs uppercase tracking-wider">Cons:</span>
                        <ul className="text-slate-300 mt-1 space-y-1">
                          {option.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-rose-400">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-cyan-400 text-xs uppercase tracking-wider">Best When:</span>
                        <p className="text-slate-300 mt-1">{option.bestWhen}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Questions */}
            {decision.questions.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  Questions to Ask
                </h4>
                <ul className="space-y-1.5">
                  {decision.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-amber-500 mt-0.5">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
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
