import { useState, useMemo, useCallback } from 'react'
import { categories } from './assets/categories'
import { Header } from './components/Header'
import { PhaseSelector } from './components/PhaseSelector'
import { SearchBar } from './components/SearchBar'
import { Stats } from './components/Stats'
import { CategorySection } from './components/CategorySection'
import { ChatModal } from './components/ChatModal'
import { ProjectsModal } from './components/ProjectsModal'
import { searchDecisions, filterCategoriesBySearch } from './utils/searchDecisions'
import type { Decision, Phase } from './types'

function App() {
  const [activePhase, setActivePhase] = useState<Phase>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [chatDecision, setChatDecision] = useState<{ decision: Decision; categoryColor: string; nudges: [string, string, string] } | null>(null)
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Compute matching decision IDs based on search query
  const matchingDecisionIds = useMemo(() => {
    if (!searchQuery) return new Set<string>()
    return searchDecisions(categories, searchQuery)
  }, [searchQuery])

  // Filter categories based on search results
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    return filterCategoriesBySearch(categories, matchingDecisionIds)
  }, [searchQuery, matchingDecisionIds])

  const isSearchActive = searchQuery.length > 0
  const hasSearchResults = filteredCategories.length > 0

  return (
    <div className="min-h-screen blueprint-grid">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header onOpenProjects={() => setIsProjectsOpen(true)} />
        <PhaseSelector activePhase={activePhase} setActivePhase={setActivePhase} />
        
        <div className="my-6 flex justify-start">
          <SearchBar onSearch={handleSearch} throttleMs={300} minChars={3} />
        </div>

        <Stats activePhase={activePhase} />
        
        <main>
          {isSearchActive && !hasSearchResults ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg">No decisions found matching "{searchQuery}"</p>
              <p className="text-slate-500 text-sm mt-2">Try searching for different keywords</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <CategorySection 
                key={category.id} 
                category={category} 
                activePhase={activePhase}
                onOpenChat={(decision) => {
                  // Find the original category to get the correct nudges
                  const originalCategory = categories.find(c => c.id === category.id)
                  setChatDecision({ 
                    decision, 
                    categoryColor: category.color, 
                    nudges: originalCategory?.nudges || category.nudges 
                  })
                }}
              />
            ))
          )}
        </main>

        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>Built to help navigate the complexity of modern web development decisions.</p>
          <p className="mt-2 text-slate-600">Filter by phase to focus on what matters at each stage.</p>
        </footer>
      </div>

      {chatDecision && (
        <ChatModal
          decision={chatDecision.decision}
          isOpen
          onClose={() => setChatDecision(null)}
          categoryColor={chatDecision.categoryColor}
          nudges={chatDecision.nudges}
        />
      )}

      <ProjectsModal 
        isOpen={isProjectsOpen} 
        onClose={() => setIsProjectsOpen(false)} 
      />
    </div>
  )
}

export default App
