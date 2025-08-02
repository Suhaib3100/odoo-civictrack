# Authentication System Setup

This document explains how to set up and use the authentication system for the CivicTrack application.

## Backend Setup

The backend is already configured with a complete authentication system including:

### Features
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Token refresh functionality
- Password reset (basic implementation)
- User profile management
- Role-based access control

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Environment Variables Required

Create a `.env` file in the backend directory with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/civictrack"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. Install dependencies:
   ```bash
   cd apps/backend
   npm install
   ```

2. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

## Frontend Setup

The frontend has been updated with a complete authentication system:

### Features
- Authentication context for state management
- Protected routes
- Login and signup forms with validation
- User navigation with logout
- Toast notifications for feedback
- Automatic token refresh

### Components Added/Updated

#### New Components
- `lib/auth.ts` - Authentication service
- `contexts/auth-context.tsx` - Authentication context
- `components/protected-route.tsx` - Route protection
- `components/user-nav.tsx` - User navigation
- `components/auth-navbar.tsx` - Authenticated navbar

#### Updated Components
- `components/login-page.tsx` - Real authentication
- `components/signup-page.tsx` - Real authentication
- `components/ui/sign-in.tsx` - Loading and error states
- `components/ui/hero-section-5.tsx` - User data integration
- `components/landing-page.tsx` - Authentication state
- `app/layout.tsx` - Auth provider and toaster

### Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Frontend

1. Install dependencies:
   ```bash
   cd apps/frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### User Registration
1. Navigate to `/signup`
2. Fill in email, password, and name
3. Submit the form
4. User will be automatically logged in and redirected to home

### User Login
1. Navigate to `/login`
2. Enter email and password
3. Submit the form
4. User will be logged in and redirected to home

### Protected Routes
Wrap any component that requires authentication with the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from '@/components/protected-route'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### Using Authentication in Components

```tsx
import { useAuth } from '@/contexts/auth-context'

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Security Features

- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- CORS configuration
- Input validation
- Secure token storage in localStorage
- Automatic token refresh

## Testing the Authentication

1. Start both backend and frontend servers
2. Navigate to the frontend (http://localhost:3000)
3. Click "Sign In to Get Started" or "Get Started"
4. Create a new account or log in with existing credentials
5. Verify that the user menu shows your information
6. Test logout functionality
7. Try accessing protected routes without authentication

## Next Steps

- Implement Google OAuth authentication
- Add email verification
- Implement proper password reset with email
- Add two-factor authentication
- Implement session management
- Add user roles and permissions 