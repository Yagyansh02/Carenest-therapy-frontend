import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assessmentService } from '../../api/assessment';

// Async thunks for API calls
export const submitAssessment = createAsyncThunk(
  'assessment/submit',
  async (assessmentData, { rejectWithValue }) => {
    try {
      const response = await assessmentService.submitAssessment(assessmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit assessment'
      );
    }
  }
);

export const fetchMyAssessment = createAsyncThunk(
  'assessment/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await assessmentService.getMyAssessment();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assessment'
      );
    }
  }
);

export const fetchRecommendedTherapists = createAsyncThunk(
  'assessment/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await assessmentService.getRecommendedTherapists();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recommendations'
      );
    }
  }
);

export const fetchAssessmentByPatientId = createAsyncThunk(
  'assessment/fetchByPatientId',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await assessmentService.getAssessmentByPatientId(patientId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patient assessment'
      );
    }
  }
);

export const fetchAllAssessments = createAsyncThunk(
  'assessment/fetchAll',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await assessmentService.getAllAssessments(page, limit);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assessments'
      );
    }
  }
);

export const deleteAssessment = createAsyncThunk(
  'assessment/delete',
  async (assessmentId, { rejectWithValue }) => {
    try {
      await assessmentService.deleteAssessment(assessmentId);
      return assessmentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete assessment'
      );
    }
  }
);

// Initial state
const initialState = {
  // Current user's assessment
  myAssessment: null,
  hasAssessment: false,
  
  // Recommendations
  recommendations: [],
  
  // All assessments (for admin)
  allAssessments: [],
  totalAssessments: 0,
  currentPage: 1,
  
  // Patient assessment (for therapist view)
  patientAssessment: null,
  
  // Form state
  formData: {
    ageGroup: '',
    occupation: '',
    lifestyle: '',
    activityLevel: '',
    concerns: [],
    otherConcern: '',
    duration: '',
    impactLevel: 3,
  },
  currentStep: 1,
  
  // Loading states
  loading: {
    submit: false,
    fetch: false,
    recommendations: false,
    delete: false,
  },
  
  // Error states
  error: {
    submit: null,
    fetch: null,
    recommendations: null,
    delete: null,
  },
};

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    // Form management
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
    
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    
    toggleConcern: (state, action) => {
      const concern = action.payload;
      const concerns = state.formData.concerns;
      
      if (concerns.includes(concern)) {
        state.formData.concerns = concerns.filter(c => c !== concern);
      } else {
        state.formData.concerns = [...concerns, concern];
      }
    },
    
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      state.currentStep += 1;
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.currentStep = 1;
      state.error.submit = null;
    },
    
    // Reset entire assessment state (used on logout)
    resetAssessmentState: (state) => {
      state.myAssessment = null;
      state.hasAssessment = false;
      state.recommendations = [];
      state.formData = initialState.formData;
      state.currentStep = 1;
      state.patientAssessment = null;
      state.error = initialState.error;
    },
    
    // Error management
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType) {
        state.error[errorType] = null;
      } else {
        state.error = initialState.error;
      }
    },
    
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
    
    clearPatientAssessment: (state) => {
      state.patientAssessment = null;
    },
  },
  extraReducers: (builder) => {
    // Submit Assessment
    builder
      .addCase(submitAssessment.pending, (state) => {
        state.loading.submit = true;
        state.error.submit = null;
      })
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.loading.submit = false;
        state.myAssessment = action.payload;
        state.hasAssessment = true;
        state.error.submit = null;
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.loading.submit = false;
        state.error.submit = action.payload;
      });
    
    // Fetch My Assessment
    builder
      .addCase(fetchMyAssessment.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchMyAssessment.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.myAssessment = action.payload;
        state.hasAssessment = true;
        
        // Pre-fill form data if assessment exists
        if (action.payload?.answers) {
          state.formData = {
            ...initialState.formData,
            ...action.payload.answers,
          };
        }
        state.error.fetch = null;
      })
      .addCase(fetchMyAssessment.rejected, (state, action) => {
        state.loading.fetch = false;
        state.hasAssessment = false;
        state.myAssessment = null;
        // Reset form to initial state for new users
        state.formData = initialState.formData;
        state.currentStep = 1;
        // Don't set error if assessment doesn't exist (404)
        if (!action.payload?.includes('not found')) {
          state.error.fetch = action.payload;
        }
      });
    
    // Fetch Recommended Therapists
    builder
      .addCase(fetchRecommendedTherapists.pending, (state) => {
        state.loading.recommendations = true;
        state.error.recommendations = null;
      })
      .addCase(fetchRecommendedTherapists.fulfilled, (state, action) => {
        state.loading.recommendations = false;
        state.recommendations = action.payload?.recommendations || [];
        state.error.recommendations = null;
      })
      .addCase(fetchRecommendedTherapists.rejected, (state, action) => {
        state.loading.recommendations = false;
        state.error.recommendations = action.payload;
      });
    
    // Fetch Assessment by Patient ID
    builder
      .addCase(fetchAssessmentByPatientId.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchAssessmentByPatientId.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.patientAssessment = action.payload;
        state.error.fetch = null;
      })
      .addCase(fetchAssessmentByPatientId.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      });
    
    // Fetch All Assessments
    builder
      .addCase(fetchAllAssessments.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchAllAssessments.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.allAssessments = action.payload?.assessments || [];
        state.totalAssessments = action.payload?.total || 0;
        state.currentPage = action.payload?.page || 1;
        state.error.fetch = null;
      })
      .addCase(fetchAllAssessments.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      });
    
    // Delete Assessment
    builder
      .addCase(deleteAssessment.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.loading.delete = false;
        // Remove from allAssessments if exists
        state.allAssessments = state.allAssessments.filter(
          assessment => assessment._id !== action.payload
        );
        // Clear myAssessment if it was the deleted one
        if (state.myAssessment?._id === action.payload) {
          state.myAssessment = null;
          state.hasAssessment = false;
          state.formData = initialState.formData;
        }
        state.error.delete = null;
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload;
      });
  },
});

export const {
  updateFormData,
  updateFormField,
  toggleConcern,
  setCurrentStep,
  nextStep,
  previousStep,
  resetForm,
  resetAssessmentState,
  clearError,
  clearRecommendations,
  clearPatientAssessment,
} = assessmentSlice.actions;

// Selectors
export const selectMyAssessment = (state) => state.assessment.myAssessment;
export const selectHasAssessment = (state) => state.assessment.hasAssessment;
export const selectRecommendations = (state) => state.assessment.recommendations;
export const selectFormData = (state) => state.assessment.formData;
export const selectCurrentStep = (state) => state.assessment.currentStep;
export const selectLoading = (state) => state.assessment.loading;
export const selectError = (state) => state.assessment.error;
export const selectAllAssessments = (state) => state.assessment.allAssessments;
export const selectPatientAssessment = (state) => state.assessment.patientAssessment;

export default assessmentSlice.reducer;
