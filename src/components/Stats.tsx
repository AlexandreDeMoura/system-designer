import clsx from 'clsx'
import { categories } from '../assets/categories'
import type { Phase } from '../types'

interface StatsProps {
  activePhase: Phase
}

export function Stats({ activePhase }: StatsProps) {
  const allDecisions = categories.flatMap(c => c.decisions)
  const phaseDecisions = allDecisions.filter(d => d.phase !== null).length
  const currentFiltered = activePhase 
    ? allDecisions.filter(d => d.phase === activePhase).length
    : allDecisions.length
  
  const stats = {
    totalCategories: categories.length,
    totalDecisions: allDecisions.length,
    phaseDecisions,
    currentFiltered,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Categories', value: stats.totalCategories, color: 'text-blue-400' },
        { label: 'Total Decisions', value: stats.totalDecisions, color: 'text-cyan-400' },
        { label: 'Priority Decisions', value: stats.phaseDecisions, color: 'text-emerald-400' },
        { label: 'Showing', value: stats.currentFiltered, color: 'text-amber-400' },
      ].map((stat, i) => (
        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className={clsx('text-2xl font-bold font-mono', stat.color)}>{stat.value}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

