import clsx from 'clsx'
import { phases, phaseColors } from '../theme'
import type { Phase } from '../types'

interface PhaseSelectorProps {
  activePhase: Phase
  setActivePhase: (p: Phase) => void
}

export function PhaseSelector({ activePhase, setActivePhase }: PhaseSelectorProps) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-slate-600" />
        Decision Priority Timeline
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setActivePhase(null)}
          className={clsx(
            'cursor-pointer phase-pill px-4 py-2 rounded-lg border transition-all font-medium text-sm',
            activePhase === null 
              ? 'bg-slate-700/50 border-slate-500 text-white active' 
              : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700/30'
          )}
        >
          All Phases
        </button>
        {phases.map((phase) => {
          const colors = phaseColors[phase.id]
          const isActive = activePhase === phase.id
          return (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id as Phase)}
              className={clsx(
                'cursor-pointer phase-pill px-4 py-2 rounded-lg border transition-all text-sm flex items-center gap-2',
                isActive 
                  ? [colors.bg, colors.border, colors.text, 'active', colors.glow]
                  : ['bg-slate-800/30 border-slate-700 text-slate-400', `hover:${colors.border}`, 'hover:bg-slate-700/40']
              )}
            >
              <span className={clsx('w-2 h-2 rounded-full', isActive ? 'bg-current pulse-active' : 'bg-slate-600')} />
              <span className="font-medium">{phase.name}</span>
              <span className="text-xs opacity-60">({phase.week})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

