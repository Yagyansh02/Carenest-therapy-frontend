import { useEffect, useState } from 'react';
import { therapistService } from '../../api/therapist';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Award, Briefcase, Star, DollarSign, SlidersHorizontal } from 'lucide-react';

export const TherapistList = () => {
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [experienceRange, setExperienceRange] = useState([0, 50]);
  const [rateRange, setRateRange] = useState([0, 10000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, experience, rate, rating
  
  // Available specializations (extracted from therapists)
  const [availableSpecializations, setAvailableSpecializations] = useState([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await therapistService.getAllTherapists(1, 100);
        // Backend returns: { data: { therapists: [...], pagination: {...} } }
        const therapistsList = response.data.data?.therapists || [];
        setTherapists(therapistsList);
        setFilteredTherapists(therapistsList);
        
        // Extract unique specializations
        const specs = new Set();
        therapistsList.forEach(t => {
          t.specializations?.forEach(s => specs.add(s));
        });
        setAvailableSpecializations(Array.from(specs));
        
        // Set rate range based on actual data
        if (therapistsList.length > 0) {
          const rates = therapistsList.map(t => t.sessionRate || 0);
          setRateRange([0, Math.max(...rates) + 1000]);
        }
      } catch (error) {
        console.error('Failed to fetch therapists', error);
        setError('Failed to load therapists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...therapists];

    // Search filter
    if (searchTerm) {
      result = result.filter(t => 
        t.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Specialization filter
    if (selectedSpecializations.length > 0) {
      result = result.filter(t => 
        t.specializations?.some(s => selectedSpecializations.includes(s))
      );
    }

    // Experience filter
    result = result.filter(t => 
      (t.yearsOfExperience || 0) >= experienceRange[0] && 
      (t.yearsOfExperience || 0) <= experienceRange[1]
    );

    // Rate filter
    result = result.filter(t => 
      (t.sessionRate || 0) >= rateRange[0] && 
      (t.sessionRate || 0) <= rateRange[1]
    );

    // Verified filter
    if (verifiedOnly) {
      result = result.filter(t => t.verificationStatus === 'verified');
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => 
          (a.userId?.fullName || '').localeCompare(b.userId?.fullName || '')
        );
        break;
      case 'experience':
        result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
        break;
      case 'rate':
        result.sort((a, b) => (a.sessionRate || 0) - (b.sessionRate || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        break;
    }

    setFilteredTherapists(result);
  }, [searchTerm, selectedSpecializations, experienceRange, rateRange, verifiedOnly, sortBy, therapists]);

  const toggleSpecialization = (spec) => {
    setSelectedSpecializations(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecializations([]);
    setExperienceRange([0, 50]);
    setRateRange([0, 10000]);
    setVerifiedOnly(false);
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#748DAE] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Therapist</h1>
          <p className="text-gray-600">Browse through our verified mental health professionals</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, specialization, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#748DAE] focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                showFilters || selectedSpecializations.length > 0
                  ? 'bg-[#748DAE] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {selectedSpecializations.length > 0 && (
                <span className="bg-white text-[#748DAE] px-2 py-0.5 rounded-full text-xs font-bold">
                  {selectedSpecializations.length}
                </span>
              )}
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-600">Sort by:</span>
            {['name', 'experience', 'rate', 'rating'].map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option
                    ? 'bg-[#9ECAD6] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
            {(searchTerm || selectedSpecializations.length > 0) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-[#748DAE] hover:text-[#657B9D] font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
              >
                {/* Specializations */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSpecializations.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedSpecializations.includes(spec)
                            ? 'bg-[#9ECAD6] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Years of Experience: {experienceRange[0]} - {experienceRange[1]}+
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={experienceRange[0]}
                    onChange={(e) => setExperienceRange([parseInt(e.target.value), experienceRange[1]])}
                    className="w-full"
                  />
                </div>

                {/* Rate Range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Session Rate: ₹{rateRange[0]} - ₹{rateRange[1]}
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(...therapists.map(t => t.sessionRate || 0)) + 1000}
                    step="100"
                    value={rateRange[1]}
                    onChange={(e) => setRateRange([rateRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredTherapists.length} of {therapists.length} therapists
        </div>

        {/* Therapist Grid */}
        {filteredTherapists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg"
          >
            <p className="text-gray-600 mb-4">No therapists found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="text-[#748DAE] hover:text-[#657B9D] font-medium"
            >
              Clear filters to see all therapists
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTherapists.map((therapist, index) => (
              <motion.div
                key={therapist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex flex-col p-6 h-full hover:shadow-lg transition-shadow bg-white border border-gray-100">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {therapist.userId?.fullName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {therapist.userId?.fullName || 'Therapist'}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {therapist.specializations?.slice(0, 2).map((spec, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-[#9ECAD6] text-white rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {therapist.verificationStatus === 'verified' && (
                      <Award className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="mb-4 flex-1 text-sm text-gray-600 line-clamp-3">
                    {therapist.bio || 'Experienced therapist dedicated to helping you achieve your mental health goals.'}
                  </p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-[#748DAE]" />
                        Experience
                      </span>
                      <span className="font-semibold text-gray-900">{therapist.yearsOfExperience || 0} years</span>
                    </div>
                    {therapist.averageRating > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          Rating
                        </span>
                        <span className="font-semibold text-gray-900">{therapist.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#748DAE]" />
                        Session Rate
                      </span>
                      <span className="font-semibold text-[#748DAE]">₹{therapist.sessionRate || 0}</span>
                    </div>
                  </div>
                  
                  <Link to={`/therapists/${therapist._id}`} className="w-full">
                    <Button className="w-full bg-[#748DAE] hover:bg-[#657B9D] text-white">
                      View Profile
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};