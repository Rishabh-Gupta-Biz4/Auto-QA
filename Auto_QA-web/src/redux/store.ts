import { configureStore } from '@reduxjs/toolkit';
import authReducer, { initializeAuth, setLoading } from './slices/authSlice';
import registrationReducer, { initializeRegistration } from './slices/registrationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    registration: registrationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Subscribe to store changes and sync with localStorage
store.subscribe(() => {
  const state = store.getState();

  // Sync auth state with localStorage
  if (typeof window !== 'undefined') {
    if (state.auth.isAuthenticated && state.auth.user) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(state.auth.user));
      if (state.auth.token) {
        localStorage.setItem('token', state.auth.token);
      }
      if (state.auth.refreshToken) {
        localStorage.setItem('refreshToken', state.auth.refreshToken);
      }
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }

    // Sync registration state with localStorage
    if (state.registration.pendingRegistration) {
      localStorage.setItem(
        'pendingRegistration',
        JSON.stringify(state.registration.pendingRegistration)
      );
    } else {
      localStorage.removeItem('pendingRegistration');
    }
  }
});

// Initialize store from localStorage on client side
if (typeof window !== 'undefined') {
  try {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const pendingRegistration = localStorage.getItem('pendingRegistration');

    if (isAuthenticated && userData && token && refreshToken) {
      store.dispatch(
        initializeAuth({
          user: JSON.parse(userData),
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      );
    } else {
      store.dispatch(setLoading(false));
    }

    if (pendingRegistration) {
      store.dispatch(
        initializeRegistration({
          pendingRegistration: JSON.parse(pendingRegistration),
        })
      );
    }
  } catch (error) {
    console.error('Error initializing store from localStorage:', error);
    store.dispatch(setLoading(false));
  }
}
