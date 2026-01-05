# Google OAuth Integration Setup

## Overview
I've successfully integrated Google OAuth authentication into your Login and Signup pages using the `@react-oauth/google` library that you've already wrapped in `App.jsx`.

## Changes Made

### 1. Login.jsx
- **Added import**: `useGoogleLogin` from `@react-oauth/google`
- **Replaced**: Basic redirect method with proper `useGoogleLogin` hook implementation
- **Added**: `handleGoogleLogin` function that:
  - Receives Google access token
  - Sends it to your backend via `authAPI.googleLogin()`
  - Handles success by logging in the user and navigating to dashboard
  - Handles errors with proper error messages

### 2. Signup.jsx
- **Added import**: `useGoogleLogin` from `@react-oauth/google`
- **Replaced**: Basic redirect method with proper `useGoogleLogin` hook implementation
- **Added**: `handleGoogleSignup` function that:
  - Receives Google access token
  - Sends it to your backend via `authAPI.googleSignup()`
  - Handles success by logging in the user and navigating to dashboard
  - Handles errors with proper error messages

### 3. api.js (services)
- **Added**: `googleLogin(accessToken)` method to send Google token to backend for login
- **Added**: `googleSignup(accessToken)` method to send Google token to backend for signup

### 4. App.jsx
- **Updated**: Google Client ID to use environment variable `process.env.REACT_APP_GOOGLE_CLIENT_ID`

### 5. Environment Configuration
- **Created**: `.env.example` file with required environment variables

## Next Steps

### 1. Create `.env` file
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Get Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth Client ID
5. Configure OAuth consent screen
6. Create OAuth Client ID for Web application
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (or your frontend URL)
8. Add authorized redirect URIs:
   - `http://localhost:3000` (or your frontend URL)
9. Copy the Client ID and paste it in your `.env` file

### 3. Backend Implementation Required
You need to implement these endpoints in your backend:

**POST /api/v1/users/google-login**
- Accepts: `{ accessToken: string }`
- Should:
  1. Verify the Google access token
  2. Get user info from Google
  3. Check if user exists in database
  4. Return JWT token and user data

**POST /api/v1/users/google-signup**
- Accepts: `{ accessToken: string }`
- Should:
  1. Verify the Google access token
  2. Get user info from Google
  3. Create new user if doesn't exist
  4. Return JWT token and user data

### 4. Backend Example Implementation
Here's a sample structure for your backend:

```javascript
// Verify Google token
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(accessToken) {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
  const data = await response.json();
  return data;
}

// Google Login endpoint
router.post('/google-login', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const googleUser = await verifyGoogleToken(accessToken);
    
    // Find user by email
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }
    
    // Generate JWT token
    const token = generateJWT(user);
    
    res.json({ token, ...user.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed' });
  }
});

// Google Signup endpoint
router.post('/google-signup', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const googleUser = await verifyGoogleToken(accessToken);
    
    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }
    
    // Create new user
    user = await User.create({
      name: googleUser.name,
      email: googleUser.email,
      picture: googleUser.picture,
      // other fields as needed
    });
    
    // Generate JWT token
    const token = generateJWT(user);
    
    res.json({ token, ...user.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Google signup failed' });
  }
});
```

## Testing
1. Make sure your `.env` file has the correct Google Client ID
2. Start your frontend: `npm start`
3. Click "Sign up with Google" button
4. You should see Google's OAuth consent screen
5. After authorization, the app will receive the access token and send it to your backend

## Important Notes
- The Google OAuth popup works only on HTTPS in production (localhost is allowed for development)
- Make sure to add your production domain to Google Cloud Console authorized origins
- Store the Google Client ID securely and never commit it to version control
