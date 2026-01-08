import type { LucideIcon } from 'lucide-react'

export type Phase = 1 | 2 | 3 | 4 | null

export interface Option {
  name: string
  pros: string[]
  cons: string[]
  bestWhen: string
}

export interface Decision {
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
  icon: LucideIcon
  color: string
  decisions: Decision[]
}

