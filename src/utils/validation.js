/**
 * Production-grade validation utilities
 */

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Password must be at least 8 characters long' 
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one number' 
    };
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one letter' 
    };
  }
  
  return { isValid: true, error: null };
};

// Full name validation
export const validateFullName = (name) => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (name.trim().length < 2) {
    return { 
      isValid: false, 
      error: 'Full name must be at least 2 characters long' 
    };
  }

  if (/\d/.test(name)) {
    return {
      isValid: false,
      error: 'Full name cannot contain numbers'
    };
  }
  
  // Check if name contains at least one space (first and last name)
  if (!name.trim().includes(' ')) {
    return { 
      isValid: false, 
      error: 'Please enter your full name (first and last name)' 
    };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { 
      isValid: false, 
      error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' 
    };
  }
  
  return { isValid: true, error: null };
};

// Phone number validation (optional field)
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { isValid: true, error: null }; // Optional field
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it has 10 digits (US format)
  if (digitsOnly.length !== 10) {
    return { 
      isValid: false, 
      error: 'Please enter a valid 10-digit phone number' 
    };
  }
  
  return { isValid: true, error: null };
};

// Role validation
export const validateRole = (role) => {
  const validRoles = ['patient', 'therapist', 'supervisor'];
  
  if (!role) {
    return { isValid: false, error: 'Role is required' };
  }
  
  if (!validRoles.includes(role)) {
    return { 
      isValid: false, 
      error: 'Please select a valid role' 
    };
  }
  
  return { isValid: true, error: null };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
};

// Generic required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};

// URL validation
export const validateURL = (url) => {
  if (!url) {
    return { isValid: true, error: null }; // Optional field
  }
  
  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

// Date validation (must be in the past for DOB)
export const validateDateOfBirth = (date) => {
  if (!date) {
    return { isValid: false, error: 'Date of birth is required' };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  
  if (selectedDate >= today) {
    return { 
      isValid: false, 
      error: 'Date of birth must be in the past' 
    };
  }
  
  // Check if person is at least 13 years old
  const thirteenYearsAgo = new Date();
  thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
  
  if (selectedDate > thirteenYearsAgo) {
    return { 
      isValid: false, 
      error: 'You must be at least 13 years old' 
    };
  }
  
  return { isValid: true, error: null };
};

// Validate entire form
export const validateForm = (fields, validators) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validators).forEach((fieldName) => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    
    if (typeof validator === 'function') {
      const result = validator(value);
      if (!result.isValid) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
};

// Sanitize input (prevent XSS)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  return phone;
};
