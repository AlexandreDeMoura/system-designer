export function Header() {
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

