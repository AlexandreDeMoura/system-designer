import { useEffect, useState, type FormEvent } from 'react'
import { FolderOpen } from 'lucide-react'
import { useAuth } from '../auth'

interface HeaderProps {
  onOpenProjects: () => void
}

export function Header({ onOpenProjects }: HeaderProps) {
  const { user, isLoading, signInWithGoogle, signInWithPassword, signUpWithPassword, signOut } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setIsAuthOpen(false)
      setPassword('')
      setAuthError(null)
    }
  }, [user])

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    const error = await signInWithGoogle()
    if (error) setAuthError(error)
  }

  const handlePasswordAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)

    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setAuthError('Email and password are required.')
      return
    }

    setIsSubmitting(true)
    let error: string | null = null
    try {
      error = isSigningUp
        ? await signUpWithPassword(normalizedEmail, password)
        : await signInWithPassword(normalizedEmail, password)
    } finally {
      setIsSubmitting(false)
    }

    if (error) setAuthError(error)
  }

  const handleSignOut = async () => {
    const error = await signOut()
    if (error) setAuthError(error)
  }

  return (
    <header className="relative mb-10 py-8 border-b border-slate-800">
      <div className="absolute inset-0 animated-border opacity-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-mono text-slate-500 uppercase tracking-widest">System Blueprint</span>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={onOpenProjects}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#8b9eb3] hover:text-[#e4e8ed] hover:border-[#3a4a5a] transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Projects</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="max-w-[180px] truncate text-xs text-slate-500">
                  {user.email ?? 'Signed in'}
                </span>
                <button
                  onClick={handleSignOut}
                  className="cursor-pointer px-3 py-2 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#8b9eb3] hover:text-[#e4e8ed] hover:border-[#3a4a5a] transition-colors text-sm"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isLoading) {
                    setAuthError(null)
                    setIsAuthOpen((open) => !open)
                  }
                }}
                className="cursor-pointer px-3 py-2 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#8b9eb3] hover:text-[#e4e8ed] hover:border-[#3a4a5a] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Sign in'}
              </button>
            )}

            {!user && isAuthOpen && (
              <div className="absolute right-0 top-full mt-3 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#1e2a3a] bg-[#0c1018] p-4 shadow-2xl z-20">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#e4e8ed]">
                    {isSigningUp ? 'Create account' : 'Sign in'}
                  </h3>
                  <button
                    onClick={() => setIsAuthOpen(false)}
                    className="text-xs text-[#6b7c93] hover:text-[#e4e8ed]"
                  >
                    Close
                  </button>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="mt-3 w-full px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm"
                >
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-3 text-xs text-[#4a5a6a]">
                  <div className="h-px flex-1 bg-[#1e2a3a]" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-[#1e2a3a]" />
                </div>

                <form onSubmit={handlePasswordAuth} className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#8b9eb3] mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full px-3 py-2 rounded-lg bg-[#1a2332] border border-[#2a3a4a] text-[#e4e8ed] placeholder-[#4a5a6a] focus:outline-none focus:border-[#3a4a5a] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8b9eb3] mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a2332] border border-[#2a3a4a] text-[#e4e8ed] placeholder-[#4a5a6a] focus:outline-none focus:border-[#3a4a5a] text-sm"
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-400">{authError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-[#e4e8ed] hover:border-[#3a4a5a] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? 'Working...'
                      : isSigningUp
                      ? 'Create account'
                      : 'Sign in'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null)
                    setIsSigningUp((value) => !value)
                  }}
                  className="mt-3 text-xs text-[#6b7c93] hover:text-[#e4e8ed]"
                >
                  {isSigningUp
                    ? 'Already have an account? Sign in'
                    : 'New here? Create an account'}
                </button>
              </div>
            )}
          </div>
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
