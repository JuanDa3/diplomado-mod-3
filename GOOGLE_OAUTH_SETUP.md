# Google OAuth Integration Setup

This application now supports Google OAuth authentication alongside traditional email/password authentication.

## Features

- **Dual Authentication**: Users can sign in with either email/password or Google OAuth
- **Account Linking**: If a user signs up with Google using an email that already exists in the system, the accounts will be linked
- **Profile Pictures**: Google users will have their profile picture displayed in the header
- **Seamless Experience**: Users can switch between authentication methods

## Backend Changes

### Database Schema Updates
- Added `google_id` field to store Google's unique user ID
- Added `google_picture` field to store user's Google profile picture
- Added `auth_provider` field to track authentication method ('local' or 'google')
- Made `password` field nullable for Google OAuth users

### New API Endpoints
- `POST /api/auth/google` - Handle Google OAuth authentication

### Dependencies Added
- `google-auth-library` - For verifying Google ID tokens
- `axios` - For HTTP requests

## Frontend Changes

### Components Updated
- **Login Component**: Added Google Sign-In button with divider
- **Signup Component**: Added Google Sign-In button with divider
- **Header Component**: Display user avatar (Google profile picture or initials)
- **Auth Service**: Added Google OAuth methods

### Dependencies Added
- Google Identity Services script (loaded from CDN)

## Configuration

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Configure authorized JavaScript origins:
   - `http://localhost:80` (for development)
   - `https://localhost` (for production with HTTPS)
6. Configure authorized redirect URIs (if needed)
7. Copy the Client ID and Client Secret

### Environment Variables
The following environment variables are configured in `docker-compose.yml`:

```yaml
environment:
  - GOOGLE_CLIENT_ID=52426363202-l70p16ngub3nm3tumn37vnit7lhmislb.apps.googleusercontent.com
  - GOOGLE_CLIENT_SECRET=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
```

## Usage

### For Users
1. **Sign Up**: Users can choose between traditional registration or Google Sign-In
2. **Sign In**: Users can use either method to access their account
3. **Account Linking**: If a user tries to register with Google using an email that already exists, the accounts will be automatically linked

### For Developers
1. **Testing**: Use the provided Google OAuth credentials for testing
2. **Production**: Update the environment variables with your own Google OAuth credentials
3. **Customization**: Modify the Google Sign-In button appearance in the component CSS files

## Security Considerations

- Google ID tokens are verified on the backend before creating/authenticating users
- JWT tokens are still used for session management
- Passwords are not required for Google OAuth users
- Account linking prevents duplicate accounts with the same email

## Troubleshooting

### Common Issues
1. **Google Sign-In button not appearing**: Check if the Google script is loading properly
2. **Authentication errors**: Verify Google OAuth credentials are correct
3. **CORS issues**: Ensure authorized origins are configured in Google Cloud Console

### Debug Steps
1. Check browser console for JavaScript errors
2. Check backend logs for authentication errors
3. Verify Google OAuth credentials in environment variables
4. Test with different browsers/devices

## Future Enhancements

- Add support for other OAuth providers (Facebook, GitHub, etc.)
- Implement account unlinking functionality
- Add email verification for traditional accounts
- Implement password reset functionality 