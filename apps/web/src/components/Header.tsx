import { FolderOpen } from 'lucide-react'

interface HeaderProps {
  onOpenProjects: () => void
}

export function Header({ onOpenProjects }: HeaderProps) {
  return (
    <header className="relative mb-10 py-8 border-b border-slate-800">
      <div className="absolute inset-0 animated-border opacity-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-mono text-slate-500 uppercase tracking-widest">System Blueprint</span>
          </div>
          <button
            onClick={onOpenProjects}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#8b9eb3] hover:text-[#e4e8ed] hover:border-[#3a4a5a] transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Projects</span>
          </button>
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

