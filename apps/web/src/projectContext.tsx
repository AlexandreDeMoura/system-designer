import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Project } from '@sd/api'

type ProjectContextValue = {
  selectedProject: Project | null
  selectProject: (project: Project | null) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const value: ProjectContextValue = {
    selectedProject,
    selectProject: setSelectedProject,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}

