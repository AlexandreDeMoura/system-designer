// Phase definitions
export const phases = [
  { id: 1, name: 'Foundation', week: 'Week 1', description: 'Core technology choices', color: 'blue' },
  { id: 2, name: 'Core Architecture', week: 'Week 2-3', description: 'Structural decisions', color: 'cyan' },
  { id: 3, name: 'Developer Experience', week: 'Week 3-4', description: 'Tooling & workflow', color: 'emerald' },
  { id: 4, name: 'Polish', week: 'Ongoing', description: 'Refinement & optimization', color: 'amber' },
] as const

// Phase color utilities
export const phaseColors: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'glow-blue' },
  2: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', glow: 'glow-cyan' },
  3: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', glow: 'glow-emerald' },
  4: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'glow-amber' },
}

export const categoryColors: Record<string, { border: string; text: string; bg: string }> = {
  blue: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  violet: { border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  emerald: { border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rose: { border: 'border-rose-500/30', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  amber: { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
}

