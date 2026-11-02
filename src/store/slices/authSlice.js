import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "@/services/authService";

// Async thunk for Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ login, password }, { rejectWithValue }) => {
    try {
      const loginRes = await authService.login({ login, password });
      const data = loginRes.data || loginRes;

      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // If user info already returned in login response
      let user = data.user;
      if (!user) {
        // Otherwise fetch user info from API
        const userRes = await authService.getUserInfo();
        user = userRes.data || userRes;
      }

      return { user, accessToken, refreshToken };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      return rejectWithValue(message);
    }
  }
);

// Async thunk to restore user session on app start
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const res = await authService.getUserInfo();
      const user = res.data || res;
      return user;
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user session"
      );
    }
  }
);

// Async thunk for Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    try {
      await authService.logout();
    } catch (_error) {
      // Ignore API logout errors and continue clearing local session
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    return null;
  }
);

const initialState = {
  currentUser: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isInitialized: !localStorage.getItem("access_token"), // True if no token to check on start
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
    },
    setLogout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isInitialized = true;
      });
  },
});

export const { clearAuthError, setCurrentUser, setLogout } = authSlice.actions;
export default authSlice.reducer;
