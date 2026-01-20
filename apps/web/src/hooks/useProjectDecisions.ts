import { trpc } from '../trpc'
import { useProject } from '../projectContext'
import { useAuth } from '../auth'
import type { ProjectDecision } from '@sd/api'

/**
 * Hook to manage project decisions.
 * Returns null for decisions map if no project is selected or user is not authenticated.
 */
export function useProjectDecisions() {
  const { user } = useAuth()
  const { selectedProject } = useProject()
  const utils = trpc.useUtils()

  const isEnabled = !!user && !!selectedProject

  const { data: decisions, isLoading } = trpc.getProjectDecisions.useQuery(
    { projectId: selectedProject?.id ?? 0 },
    {
      enabled: isEnabled,
    }
  )

  const saveDecision = trpc.saveProjectDecision.useMutation({
    onSuccess: () => {
      if (selectedProject) {
        utils.getProjectDecisions.invalidate({ projectId: selectedProject.id })
      }
    },
  })

  const deleteDecision = trpc.deleteProjectDecision.useMutation({
    onSuccess: () => {
      if (selectedProject) {
        utils.getProjectDecisions.invalidate({ projectId: selectedProject.id })
      }
    },
  })

  // Convert array to map for easy lookup by decision ID
  const decisionsMap: Map<string, ProjectDecision> | null = isEnabled && decisions
    ? new Map(decisions.map((d) => [d.decision_id, d]))
    : null

  const selectOption = (decisionId: string, selectedOption: string, note?: string) => {
    if (!selectedProject) return

    saveDecision.mutate({
      projectId: selectedProject.id,
      decisionId,
      selectedOption,
      note,
    })
  }

  const clearSelection = (decisionId: string) => {
    if (!selectedProject) return

    deleteDecision.mutate({
      projectId: selectedProject.id,
      decisionId,
    })
  }

  const getSelection = (decisionId: string): ProjectDecision | undefined => {
    return decisionsMap?.get(decisionId)
  }

  return {
    /** Whether the feature is available (user logged in + project selected) */
    isAvailable: isEnabled,
    /** Whether decisions are currently loading */
    isLoading: isEnabled && isLoading,
    /** Whether a save operation is in progress */
    isSaving: saveDecision.isPending,
    /** Map of decision_id -> ProjectDecision */
    decisionsMap,
    /** Get the selection for a specific decision */
    getSelection,
    /** Save/update an option selection for a decision */
    selectOption,
    /** Clear the selection for a decision */
    clearSelection,
  }
}

