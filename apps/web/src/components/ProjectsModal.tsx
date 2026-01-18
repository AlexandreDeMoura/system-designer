import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, FolderOpen, Loader2 } from 'lucide-react'
import { trpc } from '../trpc'
import { useAuth } from '../auth'

interface ProjectsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectsModal({ isOpen, onClose }: ProjectsModalProps) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const isAuthed = !!user
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: projects, isLoading: isProjectsLoading, refetch } =
    trpc.getProjects.useQuery(undefined, { enabled: isOpen && isAuthed })

  const createProject = trpc.createProject.useMutation({
    onSuccess: () => {
      setIsCreating(false)
      setName('')
      setDescription('')
      if (isAuthed) {
        refetch()
      }
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthed || !name.trim()) return
    createProject.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0c1018] rounded-2xl border border-[#1e2a3a] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0f1419]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1a2332] border border-[#2a3a4a]">
              <FolderOpen className="w-4 h-4 text-[#8b9eb3]" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#e4e8ed]">Projects</h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg text-[#6b7c93] hover:text-[#e4e8ed] hover:bg-[#1a2332] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isAuthLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#6b7c93] animate-spin" />
            </div>
          ) : !isAuthed ? (
            <div className="text-center py-8">
              <p className="text-[#6b7c93]">Sign in to view your projects</p>
              <p className="text-sm text-[#4a5a6a] mt-1">Use the sign in button in the header</p>
            </div>
          ) : isCreating ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b9eb3] mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Project"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#e4e8ed] placeholder-[#4a5a6a] focus:outline-none focus:border-[#3a4a5a]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b9eb3] mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#e4e8ed] placeholder-[#4a5a6a] focus:outline-none focus:border-[#3a4a5a] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#8b9eb3] hover:text-[#e4e8ed] hover:bg-[#252f3f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || createProject.isPending}
                  className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createProject.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Create button */}
              <button
                onClick={() => setIsCreating(true)}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a2332] border border-dashed border-[#2a3a4a] text-[#6b7c93] hover:text-[#e4e8ed] hover:border-[#3a4a5a] transition-colors mb-4"
              >
                <Plus className="w-5 h-5" />
                <span>Create Project</span>
              </button>

              {/* Projects list */}
              {isProjectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#6b7c93] animate-spin" />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="px-4 py-3 rounded-xl bg-[#0f1419] border border-[#1e2a3a] hover:border-[#2a3a4a] transition-colors"
                    >
                      <h3 className="font-medium text-[#e4e8ed]">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-[#6b7c93] mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#6b7c93]">No projects yet</p>
                  <p className="text-sm text-[#4a5a6a] mt-1">Create your first project to get started</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
