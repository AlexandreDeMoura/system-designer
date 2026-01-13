import { useState, useRef, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, Square, MessageSquare, User } from 'lucide-react'
import clsx from 'clsx'
import { useChat, type ChatMessage } from '../hooks/useChat'
import { phaseColors, categoryColors } from '../theme'
import { MarkdownRenderer } from './MarkdownRenderer'
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

  const phaseColor = decision.phase ? phaseColors[decision.phase] : null
  const catColor = categoryColors[categoryColor]

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in"
        onClick={onClose}
      />
      
      {/* Main modal container */}
      <div className="relative w-full max-w-7xl h-[90vh] flex gap-5 animate-chat-container-in">
        
        {/* Chat Panel */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#0c1018] rounded-2xl border border-[#1e2a3a] overflow-hidden shadow-2xl">
          
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0f1419]">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a2332] border border-[#2a3a4a]">
                <MessageSquare className="w-5 h-5 text-[#8b9eb3]" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#e4e8ed]">AI Assistant</h2>
                <p className="text-xs text-[#6b7c93] mt-0.5">Discussing {decision.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-[#6b7c93] hover:text-[#e4e8ed] hover:bg-[#1a2332] transition-colors text-sm"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="cursor-pointer p-2 rounded-lg text-[#6b7c93] hover:text-[#e4e8ed] hover:bg-[#1a2332] transition-colors lg:hidden"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <EmptyState 
                decision={decision} 
                nudges={nudges} 
                onNudgeClick={(nudge) => {
                  setInput(nudge)
                  inputRef.current?.focus()
                }}
                categoryColor={categoryColor}
              />
            ) : (
              <div className="px-6 py-6 space-y-1">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                  />
                ))}
                
                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-[#1e2a3a] bg-[#0f1419] p-4">
            <form onSubmit={handleSubmit}>
              <div className="flex items-end gap-2 bg-[#1a2332] border border-[#2a3a4a] rounded-full px-4 py-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow-up..."
                  rows={1}
                  className="flex-1 bg-transparent text-[#e4e8ed] placeholder-[#4a5a6a] resize-none focus:outline-none text-[15px] leading-relaxed py-1.5"
                  style={{ minHeight: '28px', maxHeight: '120px' }}
                />
                
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="cursor-pointer shrink-0 w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors flex items-center justify-center"
                    title="Stop generating"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={clsx(
                      'cursor-pointer shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                      input.trim()
                        ? 'bg-[#3a4a5a] text-[#e4e8ed] hover:bg-[#4a5a6a]'
                        : 'bg-transparent text-[#3a4a5a] cursor-not-allowed'
                    )}
                    title="Send message"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#4a5a6a] mt-2 text-center">
                AI can make mistakes. Check important info.
              </p>
            </form>
          </div>
        </div>

        {/* Decision Context Panel - Right sidebar */}
        <div className="hidden lg:flex w-[400px] shrink-0 flex-col bg-[#0c1018] rounded-2xl border border-[#1e2a3a] overflow-hidden shadow-2xl">
          {/* Panel Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#1e2a3a] bg-[#0f1419]">
            <div className="flex items-center gap-3">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', catColor.bg)}>
                <span className={clsx('text-xs font-mono font-bold', catColor.text)}>{decision.id.slice(-2)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#e4e8ed] text-sm leading-tight">{decision.title}</h3>
                <span className="text-xs text-[#6b7c93]">Context</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-lg text-[#6b7c93] hover:text-[#e4e8ed] hover:bg-[#1a2332] transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Phase Badge */}
            {decision.phase && (
              <div>
                <span className={clsx(
                  'inline-flex text-xs px-3 py-1.5 rounded-lg font-medium',
                  phaseColor?.bg, phaseColor?.text
                )}>
                  Phase {decision.phase}
                </span>
              </div>
            )}
            
            {/* Description */}
            <p className="text-sm text-[#8b9eb3] leading-relaxed">{decision.description}</p>
            
            {/* Options */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#6b7c93] mb-3 font-semibold">Options</h4>
              <div className="space-y-2">
                {decision.options.map((option, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer bg-[#0f1419] hover:bg-[#1a2332] border border-[#1e2a3a] list-none transition-colors">
                      <span className={clsx(
                        'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold',
                        catColor.bg, catColor.text
                      )}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-[#c8d1dc] text-sm flex-1">{option.name}</span>
                      <svg className="w-4 h-4 text-[#6b7c93] transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-2 ml-9 p-3 bg-[#0f1419] rounded-xl text-sm space-y-3 border border-[#1e2a3a]">
                      <div>
                        <span className="text-emerald-400 text-[10px] uppercase tracking-wider font-semibold">Pros</span>
                        <ul className="text-[#8b9eb3] mt-1.5 space-y-1">
                          {option.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[13px]">
                              <span className="text-emerald-400/70 mt-0.5">+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-rose-400 text-[10px] uppercase tracking-wider font-semibold">Cons</span>
                        <ul className="text-[#8b9eb3] mt-1.5 space-y-1">
                          {option.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[13px]">
                              <span className="text-rose-400/70 mt-0.5">−</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-[#1e2a3a]">
                        <span className="text-cyan-400 text-[10px] uppercase tracking-wider font-semibold">Best When</span>
                        <p className="text-[#8b9eb3] mt-1.5 text-[13px]">{option.bestWhen}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Questions */}
            {decision.questions.length > 0 && (
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-[#6b7c93] mb-3 font-semibold">Questions to Consider</h4>
                <ul className="space-y-2">
                  {decision.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-amber-400/80 mt-0.5 font-bold">?</span>
                      <span className="text-[#8b9eb3] leading-relaxed">{q}</span>
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

interface EmptyStateProps {
  decision: Decision
  nudges: [string, string, string]
  onNudgeClick: (nudge: string) => void
  categoryColor: string
}

function EmptyState({ decision, nudges, onNudgeClick, categoryColor }: EmptyStateProps) {
  const catColor = categoryColors[categoryColor]
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-8 py-12">
      <div className="w-14 h-14 rounded-2xl bg-[#1a2332] border border-[#2a3a4a] flex items-center justify-center mb-6">
        <MessageSquare className="w-7 h-7 text-[#6b7c93]" />
      </div>
      
      <h3 className="text-xl font-semibold text-[#e4e8ed] mb-2 text-center">
        Start a conversation
      </h3>
      <p className="text-[#6b7c93] text-center max-w-md mb-8 leading-relaxed">
        Ask questions about <span className={catColor.text}>{decision.title}</span> to understand 
        the tradeoffs and make the right choice.
      </p>
      
      <div className="flex flex-col gap-2 w-full max-w-md">
        <span className="text-[11px] uppercase tracking-wider text-[#4a5a6a] font-semibold mb-1">Suggestions</span>
        {nudges.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onNudgeClick(suggestion)}
            className="cursor-pointer w-full text-left px-4 py-3 rounded-xl bg-[#0f1419] border border-[#1e2a3a] text-[#8b9eb3] hover:text-[#e4e8ed] hover:bg-[#1a2332] hover:border-[#2a3a4a] transition-all text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
}

const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx(
      'py-3 animate-message-in flex',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={clsx(
        'flex gap-3 max-w-[85%]',
        isUser && 'flex-row-reverse'
      )}>
        {/* Avatar */}
        <div className={clsx(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1',
          isUser 
            ? 'bg-[#2a3a4a]' 
            : 'bg-[#1a2332] border border-[#2a3a4a]'
        )}>
          {isUser ? (
            <User className="w-4 h-4 text-[#8b9eb3]" />
          ) : (
            <svg className="w-4 h-4 text-[#6b9fff]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z" />
            </svg>
          )}
        </div>
        
        {/* Message content */}
        <div className={clsx(
          'min-w-0', // Allow content to shrink for code overflow
          isUser 
            ? 'bg-[#1a2a3a] rounded-2xl rounded-tr-sm px-4 py-3' 
            : 'pt-1'
        )}>
          {isUser ? (
            <p className="text-[15px] whitespace-pre-wrap leading-[1.7] text-[#e4e8ed]">
              {message.content}
            </p>
          ) : (
            // Assistant messages: full markdown rendering
            <MarkdownRenderer 
              content={message.content} 
              isStreaming={message.isStreaming} 
            />
          )}
        </div>
      </div>
    </div>
  )
})
