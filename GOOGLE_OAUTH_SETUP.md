# Google OAuth Setup for Supabase

This guide will help you configure Google OAuth authentication for your Supabase project.

## Prerequisites

1. A Google Cloud Console account
2. A Supabase project with the URL: `https://xwagzemazsgrlyaahgcd.supabase.co`

## Step 1: Configure Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add the following authorized redirect URIs:
     - `https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://clinquant-khapse-aab883.netlify.app/auth/callback` (for Netlify production)

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list and click "Enable"
4. Enter your Google OAuth credentials:
   - **Client ID**: Copy from Google Cloud Console
   - **Client Secret**: Copy from Google Cloud Console
5. Set the redirect URL to: `https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback`
6. Save the configuration

## Step 3: Environment Variables (Optional)

If you want to use environment variables for the OAuth configuration, add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xwagzemazsgrlyaahgcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authentication, you'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - **CRITICAL**: The redirect URI in Google Cloud Console must match exactly: `https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback`
   - Check for typos, extra spaces, or missing characters
   - Ensure you're using HTTPS (not HTTP) for the production URL
   - Make sure the URI ends with `/auth/v1/callback` (not just `/callback`)
   - If testing locally, also add: `http://localhost:3000/auth/callback`

2. **"invalid_client" error**:
   - Check that your Client ID and Client Secret are correct in Supabase
   - Ensure the Google+ API is enabled in Google Cloud Console
   - Verify the credentials are copied correctly (no extra spaces)

3. **"access_denied" error**:
   - Check that the OAuth consent screen is properly configured
   - Ensure the app is not in testing mode with restricted users
   - Make sure the user's email is added to test users if in testing mode

4. **"Error 400: redirect_uri_mismatch"**:
   - This is the most common error
   - Double-check the redirect URI in Google Cloud Console
   - The URI must be exactly: `https://xwagzemazsgrlyaahgcd.supabase.co/auth/v1/callback`
   - For Netlify production, also add: `https://clinquant-khapse-aab883.netlify.app/auth/callback`
   - No trailing slashes or additional parameters

### Testing Locally:

For local development, make sure to add `http://localhost:3000/auth/callback` to your Google OAuth redirect URIs.

### Netlify Production Setup:

Since your app is hosted on Netlify at `https://clinquant-khapse-aab883.netlify.app/`, make sure to:

1. **Add Netlify redirect URI to Google Cloud Console**:
   ```
   https://clinquant-khapse-aab883.netlify.app/auth/callback
   ```

2. **Verify Supabase configuration**:
   - Ensure your Supabase project allows the Netlify domain
   - Check that the redirect URL is properly configured

3. **Test the OAuth flow**:
   - Visit your Netlify site: https://clinquant-khapse-aab883.netlify.app/
   - Try the Google login
   - Check browser console for any errors

## Security Notes

- Keep your Client Secret secure and never expose it in client-side code
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
- Use HTTPS in production

## Features Included

✅ Google OAuth login and signup
✅ Automatic user profile creation
✅ Role assignment (default: 'users')
✅ OAuth callback handling
✅ Error handling and user feedback
✅ Responsive UI with Google branding

The integration is now ready to use! Users can sign in with their Google accounts and will be automatically assigned the 'users' role by default.
