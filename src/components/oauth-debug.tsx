"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/service/authService'

export function OAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<string>('')

  const checkOAuthConfig = () => {
    const info = `
Current URL: ${window.location.origin}
Expected Redirect URI: ${window.location.origin}/auth/callback
Supabase Redirect URI: https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback

Google Cloud Console should have:
- https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback
- ${window.location.origin}/auth/callback
- https://clinquant-khapse-aab883.netlify.app/auth/callback (for Netlify production)

Make sure these URIs match exactly in your Google OAuth configuration.
    `.trim()
    
    setDebugInfo(info)
  }

  const testGoogleLogin = async () => {
    try {
      console.log('Testing Google login...')
      await authService.loginWithGoogle()
    } catch (error) {
      console.error('Google login test error:', error)
      setDebugInfo(prev => prev + `\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>OAuth Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-x-2">
          <Button onClick={checkOAuthConfig} variant="outline">
            Check Configuration
          </Button>
          <Button onClick={testGoogleLogin} variant="outline">
            Test Google Login
          </Button>
        </div>
        
        {debugInfo && (
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Steps to fix redirect_uri_mismatch:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Go to Google Cloud Console</li>
            <li>Navigate to APIs & Services → Credentials</li>
            <li>Click on your OAuth 2.0 Client ID</li>
            <li>In "Authorized redirect URIs", add these URIs:</li>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li><code>https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback</code></li>
              <li><code>https://clinquant-khapse-aab883.netlify.app/auth/callback</code></li>
              <li><code>http://localhost:3000/auth/callback</code> (for local dev)</li>
            </ul>
            <li>Save the changes</li>
            <li>Wait 5-10 minutes for changes to propagate</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}


