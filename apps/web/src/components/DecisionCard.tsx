import { useState } from 'react'
import clsx from 'clsx'
import { MessageSquareText, Check, X } from 'lucide-react'
import { phaseColors, categoryColors } from '../theme'
import type { Decision } from '../types'
import type { ProjectDecision } from '@sd/api'

interface DecisionCardProps {
  decision: Decision
  categoryColor: string
  isHighlighted: boolean
  onOpenChat: () => void
  /** Whether the save feature is available (logged in + project selected) */
  canSaveDecision?: boolean
  /** The current selection for this decision, if any */
  currentSelection?: ProjectDecision
  /** Callback to save a selection */
  onSelectOption?: (optionName: string) => void
  /** Callback to clear the selection */
  onClearSelection?: () => void
  /** Whether a save operation is in progress */
  isSaving?: boolean
}


const buttonColors: Record<string, string> = {
  blue: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 hover:shadow-blue-500/10',
  cyan: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:shadow-cyan-500/10',
  violet: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/30 hover:shadow-violet-500/10',
  emerald: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:shadow-emerald-500/10',
  rose: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 hover:shadow-rose-500/10',
  amber: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 hover:shadow-amber-500/10',
}

export function DecisionCard({ 
  decision, 
  categoryColor, 
  isHighlighted, 
  onOpenChat,
  canSaveDecision = false,
  currentSelection,
  onSelectOption,
  onClearSelection,
  isSaving = false,
}: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const phaseColor = decision.phase ? phaseColors[decision.phase] : null
  const catColor = categoryColors[categoryColor]
  const btnColor = buttonColors[categoryColor] || buttonColors.blue
  const selectedOptionName = currentSelection?.selected_option

  return (
    <div 
        className={clsx(
          'decision-card rounded-xl border transition-all cursor-pointer',
          isHighlighted ? 'opacity-100' : 'opacity-40',
          isExpanded ? [catColor.bg, catColor.border] : 'bg-slate-900/50 border-slate-800 hover:border-slate-700',
          isExpanded && phaseColor && phaseColor.glow
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className={clsx('text-xs font-mono', catColor.text)}>{decision.id}</span>
              <h3 className="font-semibold text-slate-100">{decision.title}</h3>
            </div>
            {decision.phase && (
              <span className={clsx('text-xs px-2 py-1 rounded-full border whitespace-nowrap', phaseColor?.bg, phaseColor?.text, phaseColor?.border)}>
                P{decision.phase}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 line-clamp-2">{decision.description}</p>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4" onClick={(e) => e.stopPropagation()}>
              {/* Options */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  Options
                  {selectedOptionName && (
                    <span className="ml-auto text-emerald-400 flex items-center gap-1 normal-case tracking-normal">
                      <Check className="w-3 h-3" />
                      {selectedOptionName}
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {decision.options.map((option, i) => {
                    const isSelected = selectedOptionName === option.name
                    return (
                      <details key={i} className="group">
                        <summary 
                          className={clsx(
                            'option-row flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer list-none transition-all',
                            isSelected 
                              ? 'bg-emerald-500/15 border border-emerald-500/30 ring-1 ring-emerald-500/20' 
                              : 'hover:bg-slate-800/50'
                          )}
                        >
                          <span className={clsx(
                            'w-5 h-5 rounded flex items-center justify-center text-xs font-mono transition-colors',
                            isSelected ? 'bg-emerald-500/20 text-emerald-400' : [catColor.bg, catColor.text]
                          )}>
                            {isSelected ? <Check className="w-3 h-3" /> : i + 1}
                          </span>
                          <span className={clsx(
                            'font-medium transition-colors',
                            isSelected ? 'text-emerald-300' : 'text-slate-200'
                          )}>
                            {option.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Selected
                            </span>
                          )}
                          <svg className="w-4 h-4 ml-auto text-slate-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className={clsx(
                          'mt-2 ml-2 p-3 rounded-lg text-sm space-y-3',
                          isSelected ? 'bg-emerald-500/5' : 'bg-slate-800/30'
                        )}>
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
                          
                          {/* Select/Clear buttons */}
                          {canSaveDecision && (
                            <div className="pt-2 border-t border-slate-700/50 flex gap-2">
                              {isSelected ? (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    onClearSelection?.()
                                  }}
                                  disabled={isSaving}
                                  className={clsx(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                    'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                  )}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Clear selection
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    onSelectOption?.(option.name)
                                  }}
                                  disabled={isSaving}
                                  className={clsx(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                    'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                  )}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {isSaving ? 'Saving...' : 'Select this option'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  })}
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
                        {/* Chat with System Designer Button */}
          <button 
            className={clsx(
              'w-full mt-4 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 font-semibold transition-all duration-300 cursor-pointer',
              'border shadow-lg',
              btnColor,
              'group'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onOpenChat()
            }}
          >
            <MessageSquareText className="w-4 h-4 transition-transform group-hover:scale-110" />
            Chat with System Designer
          </button>
            </div>
          )}
          

        </div>
      </div>
  )
}
