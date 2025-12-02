import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { ScrollToTop } from './components/ScrollToTop';
import { initSecurity } from './utils/security';
import { logger } from './utils/logger';
import { env } from './config/env';

function App() {
  useEffect(() => {
    // Initialize security features
    initSecurity();
    
    // Log app initialization
    logger.info('CareNest application initialized', {
      version: env.appVersion,
      environment: env.environment,
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
