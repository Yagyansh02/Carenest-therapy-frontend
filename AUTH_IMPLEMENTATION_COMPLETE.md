# CareNest Frontend Authentication - Complete Implementation Guide

## 🎉 Implementation Summary

A complete, production-ready authentication system has been implemented for the CareNest therapy booking platform, featuring Redux Toolkit state management, JWT token handling with automatic refresh, role-based access control, and a seamless user experience.

---

## 📦 Installed Packages

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

**Dependencies Added:**
- `@reduxjs/toolkit`: Redux state management with simplified API
- `react-redux`: React bindings for Redux
- `redux-persist`: Persist Redux state to localStorage

---

## 🏗️ Architecture Overview

### State Management Flow
```
User Action → Redux Thunk → API Call → Success/Error → Update Redux State → UI Re-renders
```

### Token Refresh Flow
```
API Request (401 Error) → Axios Interceptor → Refresh Token API → New Access Token → Retry Original Request
```

---

## 📁 Files Created/Modified

### ✨ New Files

#### 1. `/src/store/store.js`
**Purpose:** Redux store configuration with persistence

**Key Features:**
- Redux persist configuration
- LocalStorage persistence for auth state
- Store export for use in components and axios

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['auth'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
```

---

#### 2. `/src/store/slices/authSlice.js`
**Purpose:** Authentication state management and async thunks

**State Schema:**
```javascript
{
  user: null | { fullName, email, role, _id },
  isAuthenticated: boolean,
  isLoading: boolean,
  error: null | string,
  accessToken: null | string
}
```

**Async Thunks:**
1. `registerUser(userData)` - POST `/users/register`
2. `loginUser(credentials)` - POST `/users/login`
3. `logoutUser()` - POST `/users/logout`
4. `getCurrentUserData()` - GET `/users/me`
5. `refreshToken()` - POST `/users/refresh-token`

**Reducers:**
- `clearError()` - Clear error state
- `setCredentials({ accessToken, user })` - Update credentials
- `clearCredentials()` - Logout/reset state

---

### 🔄 Modified Files

#### 1. `/src/api/auth.js`
**Before:** Object-based exports (`authService`)
**After:** Individual named exports

```javascript
export const register = (userData) => apiClient.post('/users/register', userData);
export const login = (credentials) => apiClient.post('/users/login', credentials);
export const logout = () => apiClient.post('/users/logout');
export const getCurrentUser = () => apiClient.get('/users/me');
export const refreshAccessToken = () => apiClient.post('/users/refresh-token');
export const changePassword = (passwordData) => apiClient.post('/users/change-password', passwordData);
```

---

#### 2. `/src/api/axios.js`
**Added Features:**
- Request interceptor to inject Bearer token
- Response interceptor with 401 error handling
- Automatic token refresh with request queuing
- Redirect to login on refresh failure

**Token Refresh Logic:**
```javascript
// On 401 error:
1. Check if already refreshing (queue request if yes)
2. Call refresh token endpoint
3. Update Redux store with new access token
4. Process queued requests with new token
5. Retry original failed request
6. On refresh failure: clear credentials, redirect to /login
```

---

#### 3. `/src/context/AuthContext.jsx`
**Migration:** useState → Redux integration

**Before:**
- Local state management
- Direct API calls
- Manual state updates

**After:**
- Redux selector hooks for state
- Redux dispatch for actions
- Backward-compatible context API

**Usage:**
```javascript
const { user, isAuthenticated, loading, error, login, logout, register, clearError } = useAuth();
```

---

#### 4. `/src/App.jsx`
**Added:** Redux Provider and PersistGate wrappers

```javascript
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </PersistGate>
</Provider>
```

---

#### 5. `/src/pages/auth/LoginPage.jsx`
**Enhancements:**
- Redux integration with `useAuth` hook
- Loading states during authentication
- Local error handling for better UX
- Automatic redirect on successful login
- Error clearing on unmount

**Form Validation:**
- Email format validation
- Password length check (min 6 characters)
- Real-time error display

---

#### 6. `/src/pages/auth/RegisterPage.jsx`
**New Features:**
- Role selection dropdown (patient, therapist, supervisor)
- Password confirmation matching
- Full name validation
- Form validation function
- Detailed error messages
- Success redirect to login

**Validation Rules:**
```javascript
- Full name: Required, min 2 characters
- Email: Required, valid format
- Password: Required, min 6 characters
- Confirm Password: Must match password
- Role: Required, one of [patient, therapist, supervisor]
```

---

#### 7. `/src/routes/ProtectedRoute.jsx`
**Features:**
- Role-based access control
- Loading spinner during auth check
- Access denied page for unauthorized roles
- Automatic redirect to login for unauthenticated users

**Usage:**
```javascript
<ProtectedRoute allowedRoles={['therapist', 'supervisor']}>
  <AdminPage />
</ProtectedRoute>
```

---

#### 8. `/src/components/layout/Navbar.jsx`
**Conditional Rendering:**

**Authenticated State:**
- User avatar (first letter of name)
- Full name display
- Role badge
- Dropdown menu with:
  - User info (name, email, role)
  - Dashboard link
  - Logout button

**Unauthenticated State:**
- Login button
- Get Started button (register)

**Mobile Menu:**
- Responsive design
- Shows user info when logged in
- Quick access to dashboard and logout

---

#### 9. `/src/pages/dashboard/DashboardPage.jsx` (NEW)
**Role-Based Dashboards:**

**Patient Dashboard:**
- Stats: Upcoming sessions, messages, assessments, progress
- Upcoming sessions list
- Quick actions: Book session, take assessment, view resources

**Therapist Dashboard:**
- Stats: Today's sessions, active patients, pending assessments, messages
- Today's schedule
- Quick actions: View patients, review assessments, session notes

**Supervisor Dashboard:**
- Stats: Therapists, total patients, pending reviews, reports
- Recent activity feed
- Quick actions: Manage therapists, view reports, system settings

**Features:**
- Framer Motion animations
- CareNest color scheme (#9ECAD6, #748DAE, #F5CBCB)
- Responsive grid layouts
- Icon-based stat cards

---

## 🔐 Security Features

### Token Management
1. **Access Token:** Stored in Redux state (memory + localStorage via persist)
2. **Refresh Token:** httpOnly cookie (managed by backend)
3. **Automatic Refresh:** On 401 error, refresh token, retry request
4. **Request Queuing:** Prevents race conditions during token refresh

### Password Security
- Minimum 6 characters
- Confirmation matching
- Backend hashing (assumed)

### Role-Based Access Control
- Protected routes check user roles
- Access denied page for unauthorized access
- Flexible role permissions

---

## 🚀 How to Use

### 1. Starting the Application

**Backend (already running):**
```bash
# Ensure backend is running at http://localhost:8000/api/v1
cd Carenest-therapy
npm start
```

**Frontend:**
```bash
cd Carenest-therapy-frontend
npm run dev
# Opens at http://localhost:5173
```

---

### 2. User Registration

**Navigate to:** http://localhost:5173/register

**Form Fields:**
- Full Name (required, min 2 chars)
- Email (required, valid format)
- Password (required, min 6 chars)
- Confirm Password (must match)
- Role (required, dropdown: patient/therapist/supervisor)

**Flow:**
1. Fill form with valid data
2. Click "Create Account"
3. Loading spinner appears
4. On success: Redirect to /login with success message
5. On error: Display error message below form

---

### 3. User Login

**Navigate to:** http://localhost:5173/login

**Form Fields:**
- Email
- Password

**Flow:**
1. Enter credentials
2. Click "Sign In"
3. Loading state: "Signing in..."
4. On success:
   - User data stored in Redux
   - Access token saved
   - Redirect to /dashboard
   - Navbar shows user info
5. On error: Display error message

---

### 4. Dashboard Access

**Protected Route:** http://localhost:5173/dashboard

**Access Control:**
- Unauthenticated: Redirect to /login
- Authenticated: Show role-specific dashboard
  - Patient: View sessions, assessments, progress
  - Therapist: View schedule, patients, actions
  - Supervisor: View statistics, manage therapists

---

### 5. Logout

**Methods:**
1. Click user avatar in navbar → "Logout"
2. Mobile menu → "Logout"

**Flow:**
1. Call logout API
2. Clear Redux state
3. Clear persisted data
4. Redirect to homepage
5. Navbar shows login/register buttons

---

## 🧪 Testing Scenarios

### 1. New User Registration
```bash
Test Data:
- Full Name: "John Doe"
- Email: "john@test.com"
- Password: "password123"
- Confirm Password: "password123"
- Role: "patient"

Expected:
✅ Successful registration
✅ Redirect to /login
✅ Can login with same credentials
```

---

### 2. Login → Dashboard
```bash
Flow:
1. Login with valid credentials
2. Check Redux state updated
3. Access token stored
4. Redirected to /dashboard
5. Dashboard shows role-specific content
6. Navbar shows user info

Expected:
✅ All steps complete successfully
✅ User persists on page refresh
```

---

### 3. Token Refresh (Automatic)
```bash
Simulation:
1. Login and get access token
2. Wait for token to expire (or simulate 401)
3. Make API request to protected endpoint
4. Axios interceptor catches 401
5. Refresh token automatically
6. Retry original request

Expected:
✅ Seamless user experience
✅ No visible errors
✅ Request completes successfully
```

---

### 4. Protected Route Access
```bash
Test 1: Unauthenticated Access
- Navigate to /dashboard without login
Expected: Redirect to /login

Test 2: Role-Based Access
- Login as "patient"
- Try to access therapist-only route
Expected: Access Denied page OR redirect

Test 3: Authorized Access
- Login with correct role
- Access allowed route
Expected: Content displays
```

---

### 5. Logout Flow
```bash
Steps:
1. Login successfully
2. Navigate to dashboard
3. Click logout
4. Check Redux state cleared
5. Check localStorage cleared
6. Check redirected to homepage
7. Try to access /dashboard again

Expected:
✅ Complete state cleanup
✅ Redirect to login
✅ No lingering user data
```

---

## 🎨 UI/UX Features

### Design System
- **Colors:**
  - Primary: `#9ECAD6` (soft teal)
  - Secondary: `#748DAE` (muted blue)
  - Accent: `#F5CBCB` (soft pink)
  - No gradients (as specified)

### Animations
- Framer Motion page transitions
- Loading spinners
- Smooth dropdown menus
- Hover effects on buttons

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile
- Grid layouts adjust to screen size
- Touch-friendly buttons

---

## 🔧 Configuration

### Backend API Endpoints
```javascript
Base URL: http://localhost:8000/api/v1

Auth Endpoints:
- POST /users/register        (Register new user)
- POST /users/login           (Login)
- POST /users/logout          (Logout)
- GET  /users/me              (Get current user)
- POST /users/refresh-token   (Refresh access token)
- POST /users/change-password (Change password)
```

### Redux Store Structure
```javascript
{
  auth: {
    user: {
      _id: string,
      fullName: string,
      email: string,
      role: 'patient' | 'therapist' | 'supervisor'
    },
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    accessToken: string | null
  }
}
```

---

## 🐛 Error Handling

### Types of Errors

**1. Validation Errors (Client-Side)**
- Invalid email format
- Password too short
- Passwords don't match
- Missing required fields

**2. API Errors (Server-Side)**
- User already exists
- Invalid credentials
- Server error (500)
- Network error

**3. Authentication Errors**
- Token expired (handled automatically)
- Invalid token (redirect to login)
- Refresh token expired (redirect to login)

### Error Display
- Inline form errors (below input fields)
- Toast notifications (can be added)
- Error message in login/register pages
- Loading states prevent multiple submissions

---

## 📝 Code Examples

### Using Auth in Components
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.fullName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login({ email, password })}>Login</button>
      )}
    </div>
  );
}
```

### Protected Route with Roles
```javascript
<ProtectedRoute allowedRoles={['therapist', 'supervisor']}>
  <TherapistOnlyPage />
</ProtectedRoute>
```

### Making Authenticated API Calls
```javascript
import apiClient from '../api/axios';

// Token automatically added by axios interceptor
const getMyData = async () => {
  const response = await apiClient.get('/users/my-data');
  return response.data;
};
```

---

## 🚦 Status & Next Steps

### ✅ Completed
- Redux Toolkit setup with persistence
- Complete auth slice with async thunks
- Axios interceptors with token refresh
- Login and register pages with validation
- Protected routes with role-based access
- Navbar with user menu and logout
- Role-specific dashboard pages
- Mobile responsive design
- Error handling and loading states

### 🎯 Recommended Next Steps
1. **Add toast notifications** for better UX feedback
2. **Implement password reset** functionality
3. **Add email verification** workflow
4. **Create user profile page** for editing details
5. **Add session timeout** warning
6. **Implement remember me** checkbox
7. **Add social login** (Google, Facebook)
8. **Create admin panel** for supervisor role
9. **Add activity logging** for security
10. **Implement two-factor authentication**

### 🧪 Testing Recommendations
1. Unit tests for Redux slices
2. Integration tests for auth flow
3. E2E tests with Cypress/Playwright
4. Security penetration testing
5. Performance testing (token refresh timing)

---

## 📚 Resources & Documentation

### Dependencies Docs
- Redux Toolkit: https://redux-toolkit.js.org/
- React Redux: https://react-redux.js.org/
- Redux Persist: https://github.com/rt2zz/redux-persist
- Axios: https://axios-http.com/

### Project Files
- Backend API: `docs/API_DOCUMENTATION_GUIDE.md`
- Quick Reference: `QUICK_REFERENCE.md`
- Auth Summary: This file

---

## 🎉 Summary

A complete, production-ready authentication system has been successfully implemented for the CareNest therapy booking platform. The system includes:

✅ Redux Toolkit state management
✅ JWT token handling with automatic refresh
✅ Role-based access control (patient, therapist, supervisor)
✅ Secure token storage (memory + persistence)
✅ Form validation and error handling
✅ Loading states and smooth UX
✅ Mobile responsive design
✅ Role-specific dashboards
✅ User menu in navbar
✅ Protected routes

**Ready to test!** Start the backend and frontend servers, and follow the testing scenarios above to verify the complete authentication workflow.

---

**Questions or Issues?** Check the error handling section or review the code comments in the implementation files.
