import { Search, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  throttleMs?: number
  minChars?: number
}

export function SearchBar({ onSearch, throttleMs = 300, minChars = 3 }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('')
  const lastEmittedRef = useRef<number>(0)
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const throttledSearch = useCallback((query: string) => {
    const now = Date.now()
    const elapsed = now - lastEmittedRef.current
    
    // Clear any pending timeout
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }

    // Determine effective query (empty if below minChars)
    const effectiveQuery = query.length >= minChars ? query : ''

    if (elapsed >= throttleMs) {
      // Enough time has passed, emit immediately
      lastEmittedRef.current = now
      onSearch(effectiveQuery)
    } else {
      // Schedule emission for remaining time
      pendingTimeoutRef.current = setTimeout(() => {
        lastEmittedRef.current = Date.now()
        onSearch(effectiveQuery)
        pendingTimeoutRef.current = null
      }, throttleMs - elapsed)
    }
  }, [onSearch, throttleMs, minChars])

  useEffect(() => {
    throttledSearch(inputValue)
  }, [inputValue, throttledSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current)
      }
    }
  }, [])

  const handleClear = () => {
    setInputValue('')
  }

  const showClearButton = inputValue.length > 0

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative group">
        {/* Animated border gradient on focus */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-violet-500/50 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        
        <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg backdrop-blur-sm transition-all duration-200 group-focus-within:border-cyan-500/50 group-focus-within:bg-slate-900">
          <Search className="w-5 h-5 text-slate-500 ml-4 flex-shrink-0 transition-colors group-focus-within:text-cyan-400" />
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search about a specific subject"
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 py-3 px-3 text-sm focus:outline-none"
          />
          
          {showClearButton && (
            <button
              onClick={handleClear}
              className="mr-3 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Hint text */}
      {inputValue.length > 0 && inputValue.length < minChars && (
        <p className="absolute mt-2 text-xs text-slate-500 left-0">
          Type {minChars - inputValue.length} more character{minChars - inputValue.length !== 1 ? 's' : ''} to search...
        </p>
      )}
    </div>
  )
}

