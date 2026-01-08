import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { categories } from './assets/categories'
// Types
type Phase = 1 | 2 | 3 | 4 | null

interface Option {
  name: string
  pros: string[]
  cons: string[]
  bestWhen: string
}

interface Decision {
  id: string
  title: string
  description: string
  phase: Phase
  options: Option[]
  questions: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  decisions: Decision[]
}

// Phase definitions
const phases = [
  { id: 1, name: 'Foundation', week: 'Week 1', description: 'Core technology choices', color: 'blue' },
  { id: 2, name: 'Core Architecture', week: 'Week 2-3', description: 'Structural decisions', color: 'cyan' },
  { id: 3, name: 'Developer Experience', week: 'Week 3-4', description: 'Tooling & workflow', color: 'emerald' },
  { id: 4, name: 'Polish', week: 'Ongoing', description: 'Refinement & optimization', color: 'amber' },
] as const


// Phase color utilities
const phaseColors: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'glow-blue' },
  2: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', glow: 'glow-cyan' },
  3: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', glow: 'glow-emerald' },
  4: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'glow-amber' },
}

const categoryColors: Record<string, { border: string; text: string; bg: string }> = {
  blue: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  violet: { border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  emerald: { border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rose: { border: 'border-rose-500/30', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  amber: { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
}

// Components
function PhaseSelector({ activePhase, setActivePhase }: { activePhase: Phase; setActivePhase: (p: Phase) => void }) {
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

function DecisionCard({ decision, categoryColor, isHighlighted }: { 
  decision: Decision; 
  categoryColor: string;
  isHighlighted: boolean;
}) {
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
                    <div className="mt-2 ml-7 p-3 bg-slate-800/30 rounded-lg text-sm space-y-2">
                      <div>
                        <span className="text-emerald-400 text-xs uppercase tracking-wider">Pros:</span>
                        <p className="text-slate-300 mt-1">{option.pros.join(' • ')}</p>
                      </div>
                      <div>
                        <span className="text-rose-400 text-xs uppercase tracking-wider">Cons:</span>
                        <p className="text-slate-300 mt-1">{option.cons.join(' • ')}</p>
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

function CategorySection({ category, activePhase }: { category: Category; activePhase: Phase }) {
  const colors = categoryColors[category.color]
  const filteredDecisions = useMemo(() => {
    if (activePhase === null) return category.decisions
    return category.decisions.filter(d => d.phase === activePhase || d.phase === null)
  }, [category.decisions, activePhase])

  const phaseDecisions = useMemo(() => {
    return category.decisions.filter(d => d.phase !== null).length
  }, [category.decisions])

  if (filteredDecisions.length === 0) return null

  return (
    <section className="category-section mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className={clsx('text-2xl', colors.text)}>{category.icon}</span>
        <h2 className="text-xl font-bold text-slate-100">{category.name}</h2>
        <span className="text-xs text-slate-500 ml-auto">
          {phaseDecisions} priority decision{phaseDecisions !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

function Header() {
  return (
    <header className="relative mb-10 py-8 border-b border-slate-800">
      <div className="absolute inset-0 animated-border opacity-10" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-sm font-mono text-slate-500 uppercase tracking-widest">System Blueprint</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-3">
          Web App Technical Decisions
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          A comprehensive map of architectural decisions when building modern web applications. 
          Filter by phase to focus on what matters at each stage of development.
        </p>
      </div>
    </header>
  )
}

function Stats({ activePhase }: { activePhase: Phase }) {
  const stats = useMemo(() => {
    const allDecisions = categories.flatMap(c => c.decisions)
    const phaseDecisions = allDecisions.filter(d => d.phase !== null)
    const filtered = activePhase 
      ? allDecisions.filter(d => d.phase === activePhase)
      : allDecisions
    
    return {
      totalCategories: categories.length,
      totalDecisions: allDecisions.length,
      phaseDecisions: phaseDecisions.length,
      currentFiltered: filtered.length,
    }
  }, [activePhase])

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

function App() {
  const [activePhase, setActivePhase] = useState<Phase>(null)

  return (
    <div className="min-h-screen blueprint-grid">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        <PhaseSelector activePhase={activePhase} setActivePhase={setActivePhase} />
        <Stats activePhase={activePhase} />
        
        <main>
          {categories.map((category) => (
            <CategorySection 
              key={category.id} 
              category={category} 
              activePhase={activePhase}
            />
          ))}
        </main>

        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>Built to help navigate the complexity of modern web development decisions.</p>
          <p className="mt-2 text-slate-600">Filter by phase to focus on what matters at each stage.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
