import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../api/assessment';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, loading, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setEmail(location.state.email);
      }
    }
  }, [location.state]);

  // Check if user needs to complete assessment after login
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (isAuthenticated && user) {
        // Therapists go to profile setup if not completed
        if (user.role === 'therapist') {
          navigate('/therapist/setup-profile', { replace: true });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#9ECAD6]/10">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-800" style={{ fontFamily: 'serif' }}>
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your CareNest account
          </p>
        </div>

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {(error || localError) && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{error || localError}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full bg-[#748DAE] hover:bg-[#748DAE]/90 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="font-medium text-[#748DAE] hover:text-[#748DAE]/80">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};