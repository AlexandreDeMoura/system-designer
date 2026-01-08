import { useState } from 'react'
import { categories } from './assets/categories'
import { Header } from './components/Header'
import { PhaseSelector } from './components/PhaseSelector'
import { Stats } from './components/Stats'
import { CategorySection } from './components/CategorySection'
import type { Phase } from './types'

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
