import { createSlice } from '@reduxjs/toolkit';

// Hydrate initial state from localStorage
const loadUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
    localStorage.removeItem('user');
  }
  return null;
};

const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Persist to localStorage for session continuity across reloads
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    updateProfile: (state, action) => {
      // Merge updated profile fields into the existing user object
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setUser, logout, updateProfile } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserToken = (state) => state.auth.user?.token ?? null;
export const selectUserRole = (state) => state.auth.user?.role ?? null;

export default authSlice.reducer;
