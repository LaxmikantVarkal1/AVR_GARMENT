import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/service/authService'
import { useAtom } from 'jotai'
import { userAtom, authenticated } from '@/store/atoms'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [, setUser] = useAtom(userAtom)
  const [, setIsAuthenticated] = useAtom(authenticated)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true)
        setError(null)

        // Wait a moment for the URL to be processed by Supabase
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Handle the OAuth callback
        const user = await authService.handleOAuthCallback()
        
        if (user) {
          // Set user data and mark as authenticated
          console.log("user", user);
          setUser(user)
          setIsAuthenticated(true)
          
          // Redirect to dashboard
          navigate('/')
        } else {
          setError('Authentication failed. Please try again.')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate, setUser, setIsAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/auth/signin')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}
