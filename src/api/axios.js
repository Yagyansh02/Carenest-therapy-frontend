import axios from 'axios';
import { store } from '../store/store';
import { clearCredentials, setCredentials } from '../store/slices/authSlice';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { handleError } from '../utils/errorHandler';

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    logger.apiRequest(config.method, config.url, config.data);
    
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    logger.apiResponse(
      response.config.method,
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error
    logger.apiResponse(
      originalRequest?.method,
      originalRequest?.url,
      error.response?.status,
      error.response?.data
    );

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt refresh for login endpoint
      if (originalRequest.url?.includes('/users/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${env.apiBaseUrl}/users/refresh-token`,
          {},
          { withCredentials: true, timeout: 10000 }
        );
        
        const newAccessToken = data.data.accessToken;
        store.dispatch(setCredentials({ accessToken: newAccessToken }));
        
        logger.info('Token refreshed successfully');
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError);
        processQueue(refreshError, null);
        store.dispatch(clearCredentials());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle and log errors
    // Don't log 404s for specific endpoints where it's expected
    const isExpectedError = error.response?.status === 404 && 
      (error.config?.url?.includes('/therapists/me') || error.config?.url?.includes('/users/me'));
    
    if (!isExpectedError) {
      logger.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    }

    const handledError = handleError(error, isExpectedError ? '' : 'API Request');
    
    // Attach original response for components to check status
    if (error.response) {
      handledError.response = error.response;
    }
    
    return Promise.reject(handledError);
  }
);

export default apiClient;