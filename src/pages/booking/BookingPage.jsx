import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { therapistService } from '../../api/therapist';
import { sessionService } from '../../api/session';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const BookingPage = () => {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  // Session details
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTherapistDetails();
  }, [therapistId]);

  useEffect(() => {
    if (therapist) {
      fetchTherapistSessions();
    }
  }, [therapist]);

  useEffect(() => {
    if (selectedDate && therapist) {
      generateTimeSlots();
    }
  }, [selectedDate, therapist]);

  const fetchTherapistDetails = async () => {
    try {
      setLoading(true);
      const response = await therapistService.getTherapistById(therapistId);
      setTherapist(response.data.data);
    } catch (err) {
      setError('Failed to load therapist details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTherapistSessions = async () => {
    try {
      // Fetch therapist's sessions to mark booked dates
      const response = await sessionService.getAllSessions();
      const sessions = response.data.data.sessions || [];
      
      // Get therapist's user ID for comparison
      const therapistUserId = therapist?.userId?._id || therapist?.userId;
      
      // Extract booked dates - compare with therapist's user ID
      const booked = sessions
        .filter(s => {
          const sessionTherapistId = s.therapistId?._id || s.therapistId;
          return sessionTherapistId === therapistUserId && s.status === 'scheduled';
        })
        .map(s => new Date(s.scheduledAt).toDateString());
      
      setBookedDates([...new Set(booked)]);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const generateTimeSlots = () => {
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    let availability = therapist?.availability?.[dayOfWeek] || [];

    // If therapist hasn't set availability, use default working hours (9 AM - 5 PM)
    if (availability.length === 0 && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayOfWeek)) {
      availability = ['09:00-17:00'];
    }

    if (availability.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    availability.forEach(timeRange => {
      const [start, end] = timeRange.split('-');
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(time);
      }
    });

    setAvailableSlots(slots);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;
    
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    let hasAvailability = therapist?.availability?.[dayOfWeek]?.length > 0;
    
    // If therapist hasn't set availability, default to weekdays (Monday-Friday) being available
    if (!hasAvailability && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayOfWeek)) {
      hasAvailability = true;
    }
    
    const dateString = date.toDateString();
    const isBooked = bookedDates.includes(dateString);

    return hasAvailability && !isBooked;
  };

  const handleDateSelect = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
      setError('');
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    if (!user) {
      setError('Please login to book a session');
      navigate('/login');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const [hours, minutes] = selectedTime.split(':');
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // therapistId from URL is the Therapist profile ID, but we need the User ID
      const therapistUserId = therapist.userId?._id || therapist.userId;
      
      if (!therapistUserId) {
        throw new Error('Therapist user ID not found');
      }

      // Check if this is a free trial (first session with this therapist)
      const sessionsResponse = await sessionService.getMyPatientSessions();
      const previousSessions = sessionsResponse.data.data.sessions.filter(
        s => s.therapistId?._id === therapistUserId && 
        ['confirmed', 'completed'].includes(s.status)
      );
      const isFreeTrial = previousSessions.length === 0;
      
      const bookingData = {
        patientId: user._id,
        therapistId: therapistUserId,
        scheduledAt: scheduledAt.toISOString(),
        duration: duration,
        sessionFee: isFreeTrial ? 0 : therapist.sessionRate,
        therapistName: therapist.userId?.fullName || 'Therapist',
      };

      // Navigate to payment page
      navigate('/payment', { state: { bookingData } });
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to proceed to payment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isAvailable = isDateAvailable(date);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={!isAvailable}
          className={`
            h-12 rounded-lg text-sm font-medium transition-all
            ${isSelected ? 'bg-primary-600 text-white ring-2 ring-primary-600' : ''}
            ${isAvailable && !isSelected ? 'bg-white hover:bg-primary-50 text-secondary-900' : ''}
            ${!isAvailable ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed' : ''}
            ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-secondary-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-secondary-900">{monthName}</h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-secondary-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-secondary-600 h-8 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600">Therapist not found</p>
          <Button onClick={() => navigate('/therapists')} className="mt-4">
            Back to Therapists
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Therapist Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700">
                {therapist.userId?.fullName?.charAt(0) || 'T'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-secondary-900">
                {therapist.userId?.fullName || 'Therapist'}
              </h1>
              <p className="text-secondary-600 mt-1">{therapist.specializations?.join(', ')}</p>
              <p className="text-lg font-semibold text-primary-600 mt-2">
                ₹{therapist.sessionRate}/session
              </p>
            </div>
          </div>
        </Card>

        {/* Availability Notice */}
        {(!therapist?.availability || Object.keys(therapist?.availability || {}).length === 0) && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Default Availability</p>
                <p className="text-sm text-blue-700 mt-1">
                  This therapist hasn't set specific availability yet. Showing default hours: Monday-Friday, 9 AM - 5 PM.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Select Date</h2>
            {renderCalendar()}
            
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex items-center gap-2 text-sm text-secondary-600">
                <div className="w-4 h-4 bg-primary-600 rounded"></div>
                <span>Selected</span>
                <div className="w-4 h-4 bg-white border border-secondary-300 rounded ml-4"></div>
                <span>Available</span>
                <div className="w-4 h-4 bg-secondary-100 rounded ml-4"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </Card>

          {/* Time Slots & Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Select Time & Details</h2>
            
            {selectedDate ? (
              <>
                <p className="text-sm text-secondary-600 mb-3">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>

                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-all
                          ${selectedTime === time 
                            ? 'bg-primary-600 text-white ring-2 ring-primary-600' 
                            : 'bg-white border border-secondary-300 hover:border-primary-500 text-secondary-900'
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 mb-6">No available time slots for this date</p>
                )}

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Session Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific concerns or topics you'd like to discuss..."
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <p className="text-secondary-500 text-center py-8">
                Please select a date to view available time slots
              </p>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Booking Summary:</p>
                <p className="text-sm text-blue-700">
                  {selectedDate.toLocaleDateString()} at {selectedTime} ({duration} min)
                </p>
                <p className="text-sm text-blue-700 font-semibold mt-1">
                  Total: ₹{therapist.sessionRate}
                </p>
              </div>
            )}

            {/* Book Button */}
            <Button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || bookingLoading}
              className="w-full"
              size="lg"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>

            <button
              onClick={() => navigate('/therapists')}
              className="w-full mt-3 text-secondary-600 hover:text-secondary-900 text-sm"
            >
              Cancel
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};