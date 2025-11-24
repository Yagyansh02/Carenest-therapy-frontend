# CareNest Frontend - Production Configuration Guide

## 🔐 Environment Variables

The application uses environment variables for configuration. Three environment files are provided:

### `.env` (Development)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENV=development
VITE_APP_NAME=CareNest
VITE_APP_VERSION=1.0.0
VITE_TOKEN_REFRESH_THRESHOLD=300000
VITE_TOKEN_STORAGE_KEY=carenest_auth
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

### `.env.production` (Production)
Update with your production API URL:
```env
VITE_API_BASE_URL=https://api.carenest.com/api/v1
VITE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

### `.env.example` (Template)
Copy this file to create your own `.env`:
```bash
cp .env.example .env
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Make sure VITE_API_BASE_URL points to your backend (default: http://localhost:5000/api/v1)
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── api/                    # API layer
│   ├── axios.js           # Configured axios instance with interceptors
│   └── auth.js            # Authentication API calls
├── assets/                # Static assets
├── components/            # React components
│   ├── common/            # Reusable components
│   └── layout/            # Layout components (Navbar, Footer)
├── config/                # Configuration files
│   └── env.js             # Environment configuration with validation
├── constants/             # Application constants
│   └── index.js           # All constants (roles, routes, messages, etc.)
├── context/               # React context providers
│   └── AuthContext.jsx    # Authentication context
├── pages/                 # Page components
│   ├── auth/              # Authentication pages (Login, Register)
│   ├── dashboard/         # Dashboard pages
│   └── ...                # Other pages
├── routes/                # Routing configuration
│   ├── AppRoutes.jsx      # Main routes
│   └── ProtectedRoute.jsx # Protected route wrapper
├── store/                 # Redux store
│   ├── store.js           # Store configuration
│   └── slices/            # Redux slices
│       └── authSlice.js   # Authentication slice
├── utils/                 # Utility functions
│   ├── errorHandler.js    # Error handling utilities
│   ├── logger.js          # Logging utilities
│   ├── security.js        # Security utilities
│   └── validation.js      # Form validation utilities
├── App.jsx                # Root component
└── main.jsx               # Entry point
```

## 🔒 Security Features

### 1. Input Sanitization
All user inputs are sanitized to prevent XSS attacks:
```javascript
import { sanitizeInput } from './utils/security';

const cleanInput = sanitizeInput(userInput);
```

### 2. Rate Limiting
Client-side rate limiting for sensitive operations:
```javascript
import { loginRateLimiter } from './utils/security';

if (!loginRateLimiter.isAllowed(email)) {
  return 'Too many attempts. Please try again later.';
}
```

### 3. Token Security
- Access tokens stored in Redux (memory + localStorage)
- Automatic token refresh on expiration
- Secure token storage with cleanup on logout

### 4. HTTPS Enforcement
Always use HTTPS in production (configured in server)

### 5. Clickjacking Prevention
Automatic detection and prevention of clickjacking attempts

## 📝 Logging

Production-grade logging system with different levels:

```javascript
import { logger } from './utils/logger';

// Different log levels
logger.error('Error message', { details });
logger.warn('Warning message', { details });
logger.info('Info message', { details });
logger.debug('Debug message', { details }); // Only in development

// API logging (automatic)
logger.apiRequest(method, url, data);
logger.apiResponse(method, url, status, data);

// User action logging
logger.userAction('Login', { email });

// Performance logging
logger.performance('Component render', duration);
```

**Storage:**
- Development: Console logging
- Production: External service integration (TODO: Add Sentry/LogRocket)
- Critical errors: Stored in localStorage (last 50)

## ⚠️ Error Handling

Comprehensive error handling with user-friendly messages:

```javascript
import { handleError, getUserFriendlyMessage } from './utils/errorHandler';

try {
  await apiCall();
} catch (error) {
  const friendlyMessage = getUserFriendlyMessage(error);
  showToast(friendlyMessage);
}
```

**Error Types:**
- `AppError`: Generic application errors
- `ValidationError`: Form validation errors
- `AuthenticationError`: Authentication failures
- `NetworkError`: Network connectivity issues

## ✅ Form Validation

Production-grade validation utilities:

```javascript
import { 
  validateEmail, 
  validatePassword, 
  validateFullName 
} from './utils/validation';

const emailResult = validateEmail('user@example.com');
if (!emailResult.isValid) {
  console.error(emailResult.error);
}
```

**Validation Rules:**
- Email: Valid format required
- Password: Min 8 chars, 1 letter, 1 number
- Full Name: Min 2 chars, first and last name
- Phone: 10 digits (US format)
- Role: Must be patient/therapist/supervisor

## 🎨 Design System

**Colors:**
- Primary: `#9ECAD6` (Soft teal)
- Secondary: `#748DAE` (Muted blue)
- Accent: `#F5CBCB` (Soft pink)

**Usage:**
```javascript
import { COLORS } from './constants';

const buttonStyle = { backgroundColor: COLORS.PRIMARY };
```

## 🔄 Redux State Management

### Auth State
```javascript
{
  auth: {
    user: { _id, fullName, email, role },
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    accessToken: string | null
  }
}
```

### Using Redux in Components
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from './store/slices/authSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const handleLogin = async (credentials) => {
    await dispatch(loginUser(credentials));
  };
};
```

## 🌐 API Configuration

### Axios Instance
Pre-configured axios instance with:
- Base URL from environment
- Automatic token injection
- Token refresh on 401
- Request/response logging
- Error handling
- 30-second timeout

### Making API Calls
```javascript
import apiClient from './api/axios';

// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', data);

// Token automatically added to headers
// Errors automatically handled and logged
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Build Output
```
dist/
├── assets/          # Compiled JS, CSS, images
├── index.html       # Entry HTML
└── ...
```

### Deploy to Production

**Option 1: Static Hosting (Vercel, Netlify)**
```bash
npm run build
# Deploy dist/ folder
```

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

**Option 3: Traditional Server (Nginx)**
```nginx
server {
  listen 80;
  server_name carenest.com;
  
  location / {
    root /var/www/carenest/dist;
    try_files $uri $uri/ /index.html;
  }
}
```

## 🔧 Environment-Specific Configurations

### Development
- Console logging enabled
- Redux DevTools enabled
- Source maps included
- Hot module replacement

### Production
- Console logging disabled (except errors)
- Redux DevTools disabled
- Source maps excluded
- Minified and optimized
- Error tracking enabled
- Analytics enabled

## 📊 Performance Optimization

### Code Splitting
```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Image Optimization
- Use WebP format where possible
- Lazy load images below the fold
- Optimize with imagemin

### Bundle Size
- Current bundle size: Check with `npm run build`
- Target: < 500KB initial load
- Use code splitting for routes

## 🛡️ Security Checklist

- [x] Environment variables for secrets
- [x] HTTPS in production
- [x] XSS protection (input sanitization)
- [x] CSRF protection (cookies with SameSite)
- [x] Rate limiting (client-side)
- [x] Secure token storage
- [x] Content Security Policy
- [x] Clickjacking prevention
- [ ] Add Sentry for error tracking (TODO)
- [ ] Add analytics (Google Analytics, etc.) (TODO)

## 📝 Common Tasks

### Add New Environment Variable
1. Add to `.env`, `.env.production`, `.env.example`
2. Add to `src/config/env.js`
3. Access via `import { env } from './config/env'`

### Add New Constant
1. Add to `src/constants/index.js`
2. Export and use: `import { CONSTANT_NAME } from './constants'`

### Add New API Endpoint
1. Create function in appropriate API file (e.g., `src/api/auth.js`)
2. Use `apiClient` from `src/api/axios.js`
3. Handle errors with try-catch

### Add New Validation Rule
1. Add to `src/utils/validation.js`
2. Export validation function
3. Use in form components

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:5000/api/v1/health

# Check CORS configuration
# Backend must allow: http://localhost:5173
```

### Environment Variables Not Loading
```bash
# Restart dev server after changing .env
npm run dev

# Ensure variables start with VITE_
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Token Refresh Not Working
- Check backend `/users/refresh-token` endpoint
- Ensure cookies are enabled (withCredentials: true)
- Check token expiration times

### Redux State Not Persisting
- Check localStorage quota
- Verify `redux-persist` configuration
- Clear browser storage and try again

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run linter: `npm run lint`
4. Commit changes: `git commit -m "Add my feature"`
5. Push to branch: `git push origin feature/my-feature`
6. Create Pull Request

## 📄 License

[Your License Here]

## 📧 Support

For support, email support@carenest.com or open an issue on GitHub.
