import clsx from 'clsx'
import { categoryColors } from '../theme'
import { DecisionCard } from './DecisionCard'
import type { Category, Phase } from '../types'

interface CategorySectionProps {
  category: Category
  activePhase: Phase
}

export function CategorySection({ category, activePhase }: CategorySectionProps) {
  const colors = categoryColors[category.color]
  const filteredDecisions = activePhase === null 
    ? category.decisions 
    : category.decisions.filter(d => d.phase === activePhase || d.phase === null)

  const phaseDecisions = category.decisions.filter(d => d.phase !== null).length

  if (filteredDecisions.length === 0) return null

  const IconComponent = category.icon

  return (
    <section className="category-section mb-12">
      <div className="flex items-center gap-3 mb-4">
        <IconComponent className={clsx('w-6 h-6', colors.text)} />
        <h2 className="text-xl font-bold text-slate-100">{category.name}</h2>
        <span className="text-xs text-slate-500 ml-auto">
          {phaseDecisions} priority decision{phaseDecisions !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {filteredDecisions.map((decision) => (
          <DecisionCard 
            key={decision.id} 
            decision={decision} 
            categoryColor={category.color}
            isHighlighted={activePhase === null || decision.phase === activePhase}
          />
        ))}
      </div>
    </section>
  )
}

