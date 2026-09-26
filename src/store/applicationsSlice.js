import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch the current user's applications
export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMy',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      if (!token) {
        return rejectWithValue('Not authenticated');
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const { data } = await axios.get('/api/applications/my', config);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch applications'
      );
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearApplications: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearApplications } = applicationsSlice.actions;

// Selectors
export const selectApplications = (state) => state.applications.items;
export const selectApplicationsLoading = (state) => state.applications.loading;
export const selectApplicationsError = (state) => state.applications.error;

export default applicationsSlice.reducer;
