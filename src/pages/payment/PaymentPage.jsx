import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { sessionService } from '../../api/session';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;

  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (!bookingData) {
      navigate('/therapists');
    }
  }, [bookingData, navigate]);

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create the session after successful payment
      const response = await sessionService.createSession({
        therapistId: bookingData.therapistId,
        patientId: bookingData.patientId,
        scheduledAt: bookingData.scheduledAt,
        duration: bookingData.duration,
        sessionFee: bookingData.sessionFee,
      });

      // Show success message
      alert('Payment successful! Your session request has been sent to the therapist for approval.');
      
      // Navigate to sessions page
      navigate('/sessions');
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData) {
    return null;
  }

  const isFree = bookingData.sessionFee === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary-900">
            {isFree ? 'Confirm Free Trial Session' : 'Complete Payment'}
          </h1>
          <p className="text-secondary-600 mt-2">
            {isFree 
              ? 'Your first session is free! Confirm to proceed.' 
              : 'Complete payment to book your therapy session'}
          </p>
        </div>

        {/* Booking Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Booking Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-secondary-100">
              <span className="text-secondary-600">Therapist</span>
              <span className="font-medium text-secondary-900">{bookingData.therapistName}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-secondary-100">
              <span className="text-secondary-600">Date</span>
              <span className="font-medium text-secondary-900">
                {new Date(bookingData.scheduledAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-secondary-100">
              <span className="text-secondary-600">Time</span>
              <span className="font-medium text-secondary-900">
                {new Date(bookingData.scheduledAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-secondary-100">
              <span className="text-secondary-600">Duration</span>
              <span className="font-medium text-secondary-900">{bookingData.duration} minutes</span>
            </div>
            
            <div className="flex justify-between items-center py-3 mt-2">
              <span className="text-lg font-semibold text-secondary-900">Total Amount</span>
              <span className="text-2xl font-bold text-primary-600">
                {isFree ? (
                  <span className="text-green-600">FREE TRIAL</span>
                ) : (
                  `₹${bookingData.sessionFee}`
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Method (only if not free) */}
        {!isFree && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3 flex items-center gap-3">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium text-secondary-900">Credit/Debit Card</span>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3 flex items-center gap-3">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-secondary-900">UPI</span>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={paymentMethod === 'netbanking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3 flex items-center gap-3">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <span className="font-medium text-secondary-900">Net Banking</span>
                </div>
              </label>
            </div>
          </Card>
        )}

        {/* Payment Details (only if not free) */}
        {!isFree && paymentMethod === 'card' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Card Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={processing}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={processing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={processing}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={processing}
                />
              </div>
            </div>
          </Card>
        )}

        {!isFree && paymentMethod === 'upi' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">UPI Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">UPI ID</label>
              <input
                type="text"
                placeholder="yourname@upi"
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={processing}
              />
            </div>
          </Card>
        )}

        {/* Info Note */}
        <Card className="p-4 mb-6 bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">Session Approval Required</p>
              <p className="text-sm text-blue-700">
                After {isFree ? 'confirming' : 'payment'}, your session request will be sent to the therapist for approval. 
                You will be notified once the therapist accepts and provides the meeting link.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            disabled={processing}
            className="flex-1 px-6 py-3 border-2 border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50 transition disabled:opacity-50"
          >
            Go Back
          </button>
          
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isFree ? 'Confirm Booking' : `Pay ₹${bookingData.sessionFee}`
            )}
          </Button>
        </div>

        {/* Dummy Payment Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900 text-center">
            <strong>Note:</strong> This is a dummy payment page for demonstration purposes. 
            No actual payment will be processed.
          </p>
        </div>
      </div>
    </div>
  );
};
