import { useState } from 'react'
import clsx from 'clsx'
import { phaseColors, categoryColors } from '../theme'
import type { Decision } from '../types'

interface DecisionCardProps {
  decision: Decision
  categoryColor: string
  isHighlighted: boolean
}

export function DecisionCard({ decision, categoryColor, isHighlighted }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const phaseColor = decision.phase ? phaseColors[decision.phase] : null
  const catColor = categoryColors[categoryColor]

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
        )}
      </div>
    </div>
  )
}

