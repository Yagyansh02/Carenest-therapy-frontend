import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../api/assessment';
import { therapistService } from '../../api/therapist';

export const LoginPage = () => {
  const [isActive, setIsActive] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [registerError, setRegisterError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const { login, register, loading, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setLoginEmail(location.state.email);
      }
    }
    // If coming from register route, show register form
    if (location.pathname === '/register') {
      setIsActive(true);
    }
  }, [location.state, location.pathname]);

  // Check if user needs to complete assessment after login
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (isAuthenticated && user) {
        // Therapists go to profile setup if not completed
        if (user.role === 'therapist') {
          try {
            await therapistService.getMyProfile();
            navigate(from, { replace: true });
          } catch (err) {
            if (err.response?.status === 404) {
              navigate('/therapist/setup-profile', { replace: true });
            } else {
              navigate(from, { replace: true });
            }
          }
          return;
        }
        
        // Patients: check if they have completed assessment
        if (user.role === 'patient') {
          try {
            await assessmentService.getMyAssessment();
            // Assessment exists, go to requested page or dashboard
            navigate(from, { replace: true });
          } catch (err) {
            // No assessment found (404), redirect to assessment form
            if (err.response?.status === 404) {
              navigate('/assessment', { 
                replace: true,
                state: { message: 'Please complete your assessment to help us match you with the right therapist.' }
              });
            } else {
              // Other error, just go to dashboard
              navigate(from, { replace: true });
            }
          }
        } else {
          // Other roles go to dashboard
          navigate(from, { replace: true });
        }
      }
    };

    checkAssessmentStatus();
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMessage('');
    
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }

    try {
      await login({ email: loginEmail, password: loginPassword });
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateRegisterForm = () => {
    const errors = {};

    if (!registerData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (registerData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!registerData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setValidationErrors({});

    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const { confirmPassword, ...registerPayload } = registerData;
      await register(registerPayload);
      // Switch to login form and show success message
      setIsActive(false);
      setSuccessMessage('Registration successful! Please log in to continue.');
      setLoginEmail(registerData.email);
      // Reset register form
      setRegisterData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
      });
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message && err.message !== 'Registration failed') {
        errorMessage = err.message;
      }
      
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('email')) {
        setRegisterError('An account with this email already exists. Please use a different email or try logging in.');
      } else {
        setRegisterError(errorMessage);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-[#9ECAD6]/10 to-[#F5CBCB]/10 p-4">
      <div className={`relative bg-white rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] overflow-hidden w-full max-w-[800px] min-h-[520px] ${isActive ? 'active' : ''}`}>
        
        {/* Sign In Form */}
        <div className={`absolute top-0 h-full transition-all duration-[600ms] ease-in-out left-0 w-1/2 z-[2] ${isActive ? 'translate-x-full' : 'translate-x-0'}`}>
          <form onSubmit={handleLoginSubmit} className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>Sign In</h1>
            
            <span className="text-sm mb-6 text-gray-600">Enter your credentials to continue</span>
            
            {successMessage && (
              <div className="w-full rounded-md bg-green-50 p-3 border border-green-200 mb-3">
                <p className="text-xs text-green-800 text-center">{successMessage}</p>
              </div>
            )}
            
            {(error || loginError) && (
              <div className="w-full rounded-md bg-red-50 p-3 border border-red-200 mb-3">
                <p className="text-xs text-red-800 text-center">{error || loginError}</p>
              </div>
            )}
            
            <input
              type="email"
              placeholder="Email"
              className="bg-gray-100 border border-gray-200 my-2.5 px-4 py-2.5 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-gray-100 border border-gray-200 my-2.5 px-4 py-2.5 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={loading}
              required
            />
            
            <a href="#" className="text-[#748DAE] text-xs no-underline my-4 hover:text-[#9ECAD6] transition-colors">Forget Your Password?</a>
            
            <button 
              type="submit"
              className="bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] text-white text-xs px-11 py-2.5 border-none rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer hover:from-[#748DAE]/90 hover:to-[#9ECAD6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading && !isActive ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full transition-all duration-[600ms] ease-in-out left-0 w-1/2 ${isActive ? 'translate-x-full opacity-100 z-[5]' : 'translate-x-0 opacity-0 z-[1]'}`}
             style={isActive ? { animation: 'show 0.6s' } : {}}>
          <form onSubmit={handleRegisterSubmit} className="bg-white flex items-center justify-center flex-col px-8 py-6 h-full overflow-y-auto overflow-x-hidden">
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Create Account</h1>
            
            <span className="text-xs mb-3 text-gray-600">Fill in your details to register</span>
            
            {(error || registerError) && (
              <div className="w-full rounded-md bg-red-50 p-2 border border-red-200 mb-2">
                <p className="text-[10px] text-red-800 text-center">{error || registerError}</p>
              </div>
            )}
            
            {Object.keys(validationErrors).length > 0 && (
              <div className="w-full rounded-md bg-yellow-50 p-2 border border-yellow-200 mb-2">
                <p className="text-[10px] text-yellow-800 text-center">
                  {Object.values(validationErrors)[0]}
                </p>
              </div>
            )}
            
            <div className="w-full space-y-2">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="bg-gray-100 border border-gray-200 px-3.5 py-2 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all"
                value={registerData.fullName}
                onChange={handleRegisterChange}
                disabled={loading}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="bg-gray-100 border border-gray-200 px-3.5 py-2 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all"
                value={registerData.email}
                onChange={handleRegisterChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                className="bg-gray-100 border border-gray-200 px-3.5 py-2 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all"
                value={registerData.password}
                onChange={handleRegisterChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="bg-gray-100 border border-gray-200 px-3.5 py-2 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                disabled={loading}
                required
              />
              
              <div className="relative z-10">
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  className="bg-gray-100 border border-gray-200 px-3.5 py-2 text-sm rounded-lg w-full outline-none focus:border-[#9ECAD6] focus:bg-white transition-all cursor-pointer appearance-none"
                  style={{ 
                    paddingRight: '2.5rem',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem'
                  }}
                  disabled={loading}
                >
                  <option value="patient">Patient</option>
                  <option value="therapist">Therapist</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit"
              className="bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] text-white text-xs px-11 py-2.5 border-none rounded-lg font-semibold tracking-wider uppercase mt-4 cursor-pointer hover:from-[#748DAE]/90 hover:to-[#9ECAD6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading && isActive ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-[600ms] ease-in-out z-[1000] ${isActive ? '-translate-x-full' : ''}`}
             style={isActive ? { borderRadius: '0 150px 100px 0' } : { borderRadius: '150px 0 0 100px' }}>
          <div className={`bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] text-white relative h-full w-[200%] transition-all duration-[600ms] ease-in-out ${isActive ? 'translate-x-1/2' : 'translate-x-0'}`}
               style={{ left: '-100%' }}>
            
            {/* Toggle Left Panel */}
            <div className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-[600ms] ease-in-out ${isActive ? 'translate-x-0' : '-translate-x-[200%]'}`}>
              <h1 className="text-3xl font-bold mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Welcome Back!</h1>
              <p className="text-sm leading-5 tracking-wide my-5">Enter your personal details to use all of site features</p>
              <button 
                type="button"
                onClick={() => setIsActive(false)}
                className="bg-transparent border-2 border-white text-white text-xs px-11 py-2.5 rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer hover:bg-white hover:text-[#748DAE] transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Toggle Right Panel */}
            <div className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-[600ms] ease-in-out ${isActive ? 'translate-x-[200%]' : 'translate-x-0'}`}
                 style={{ right: 0 }}>
              <h1 className="text-3xl font-bold mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Hello, Friend!</h1>
              <p className="text-sm leading-5 tracking-wide my-5">Register with your personal details to use all of site features</p>
              <button 
                type="button"
                onClick={() => setIsActive(true)}
                className="bg-transparent border-2 border-white text-white text-xs px-11 py-2.5 rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer hover:bg-white hover:text-[#748DAE] transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        select option {
          background-color: white;
          color: #1f2937;
          padding: 8px 12px;
          font-size: 14px;
        }
        
        select::-ms-expand {
          display: none;
        }
      `}</style>
    </div>
  );
};