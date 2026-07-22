import { createClient } from '@insforge/sdk'

const SESSION_STORAGE_KEY = 'insforge.auth.session'

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
})

if (typeof window !== 'undefined') {
  const tokenManager = (insforge as any).tokenManager
  const httpClient = insforge.getHttpClient()

  if (tokenManager && !tokenManager.__persistPatched) {
    tokenManager.__persistPatched = true

    const persistSession = () => {
      const session = tokenManager.getSession()
      if (session?.accessToken && session?.user) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }

    const savedSession = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        if (parsedSession?.accessToken && parsedSession?.user) {
          tokenManager.saveSession(parsedSession)
          httpClient.setAuthToken(parsedSession.accessToken)
        } else {
          window.localStorage.removeItem(SESSION_STORAGE_KEY)
        }
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }

    const originalSaveSession = tokenManager.saveSession.bind(tokenManager)
    tokenManager.saveSession = (session: unknown) => {
      originalSaveSession(session)
      persistSession()
    }

    const originalSetUser = tokenManager.setUser.bind(tokenManager)
    tokenManager.setUser = (user: unknown) => {
      originalSetUser(user)
      persistSession()
    }

    const originalSetAccessToken = tokenManager.setAccessToken.bind(tokenManager)
    tokenManager.setAccessToken = (token: string | null) => {
      originalSetAccessToken(token)
      persistSession()
    }

    const originalClearSession = tokenManager.clearSession.bind(tokenManager)
    tokenManager.clearSession = () => {
      originalClearSession()
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }
}

export default insforge
