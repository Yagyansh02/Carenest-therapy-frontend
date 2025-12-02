import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import assessmentReducer from './slices/assessmentSlice';
import { env } from '../config/env';

const persistConfig = {
  key: env.tokenStorageKey,
  storage,
  whitelist: ['user', 'isAuthenticated', 'accessToken'],
  version: 1,
};

const assessmentPersistConfig = {
  key: 'assessment',
  storage,
  whitelist: ['myAssessment', 'hasAssessment'],
  version: 1,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedAssessmentReducer = persistReducer(assessmentPersistConfig, assessmentReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    assessment: persistedAssessmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: env.isDevelopment,
});

export const persistor = persistStore(store);
