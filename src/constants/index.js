/**
 * Application constants
 */

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  THERAPIST: 'therapist',
  SUPERVISOR: 'supervisor',
};

export const ROLE_LABELS = {
  [USER_ROLES.PATIENT]: 'Patient',
  [USER_ROLES.THERAPIST]: 'Therapist',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
};

// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'carenest_auth_token',
  REFRESH_TOKEN: 'carenest_refresh_token',
  USER_PREFERENCES: 'carenest_preferences',
  THEME: 'carenest_theme',
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_EXISTS: 'An account with this email already exists.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters with a number and letter.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful! Redirecting...',
  LOGOUT: 'Logged out successfully.',
  REGISTER: 'Registration successful! Please login.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  BOOKING_CREATED: 'Appointment booked successfully!',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  THERAPISTS: '/therapists',
  THERAPIST_DETAIL: '/therapists/:id',
  BOOKING: '/book/:therapistId',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  SERVICES: '/services',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'hh:mm A',
  DATETIME: 'MMM DD, YYYY hh:mm A',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  PHONE_LENGTH: 10,
  MIN_AGE: 13,
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pending',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show',
};

// Session Duration (in minutes)
export const SESSION_DURATION = {
  SHORT: 30,
  STANDARD: 50,
  LONG: 90,
};

// Therapy Types
export const THERAPY_TYPES = {
  CBT: 'Cognitive Behavioral Therapy',
  DBT: 'Dialectical Behavior Therapy',
  PSYCHODYNAMIC: 'Psychodynamic Therapy',
  HUMANISTIC: 'Humanistic Therapy',
  FAMILY: 'Family Therapy',
  COUPLES: 'Couples Therapy',
  GROUP: 'Group Therapy',
  MINDFULNESS: 'Mindfulness-Based Therapy',
};

// Assessment Types
export const ASSESSMENT_TYPES = {
  PHQ9: 'PHQ-9 (Depression)',
  GAD7: 'GAD-7 (Anxiety)',
  WELLNESS: 'General Wellness',
  INTAKE: 'Initial Intake Assessment',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
};

// Colors (matching design system)
export const COLORS = {
  PRIMARY: '#9ECAD6',
  SECONDARY: '#748DAE',
  ACCENT: '#F5CBCB',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Debounce Delays
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
};

// API Timeouts
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000, // 1 minute
  LONG: 120000, // 2 minutes
};

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  LETTERS_ONLY: /^[a-zA-Z\s'-]+$/,
};

// Feature Flags (can be moved to env if needed)
export const FEATURES = {
  ENABLE_VIDEO_CALLS: false,
  ENABLE_CHAT: true,
  ENABLE_ASSESSMENTS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
};

// Default Values
export const DEFAULTS = {
  AVATAR_COLORS: [
    '#9ECAD6',
    '#748DAE',
    '#F5CBCB',
    '#A8D5BA',
    '#FFB4A2',
    '#B4A7D6',
    '#FFD98C',
    '#A7C7E7',
  ],
  PROFILE_IMAGE: '/assets/default-avatar.png',
  LOADING_TEXT: 'Loading...',
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};

// Rate Limiting
export const RATE_LIMIT = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  API_CALLS_PER_MINUTE: 60,
};

// Session Timeouts
export const SESSION = {
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
  TOKEN_REFRESH_INTERVAL: 14 * 60 * 1000, // 14 minutes
};
