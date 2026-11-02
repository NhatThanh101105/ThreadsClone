import apiClient from "@/lib/axios";

export const authService = {
  /**
   * Register new account
   * @param {{ username: string, email: string, password: string, password_confirmation: string }} data
   */
  register: async (data) => {
    const response = await apiClient.post("/api/auth/register", data);
    return response.data;
  },

  /**
   * Login with email or username and password
   * @param {{ login: string, password: string }} data
   */
  login: async (data) => {
    const response = await apiClient.post("/api/auth/login", data);
    return response.data;
  },

  /**
   * Validate username availability
   * @param {string} username
   */
  validateUsername: async (username) => {
    const response = await apiClient.post("/api/auth/validate/username", {
      username,
    });
    return response.data;
  },

  /**
   * Validate email availability
   * @param {string} email
   */
  validateEmail: async (email) => {
    const response = await apiClient.post("/api/auth/validate/email", {
      email,
    });
    return response.data;
  },

  /**
   * Send forgot password request
   * @param {string} email
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post("/api/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Validate reset password token
   * @param {string} token
   */
  validateResetToken: async (token) => {
    const response = await apiClient.get("/api/auth/reset-password/validate", {
      params: { token },
    });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {{ token: string, email: string, password: string, password_confirmation: string }} data
   */
  resetPassword: async (data) => {
    const response = await apiClient.post("/api/auth/reset-password", data);
    return response.data;
  },

  /**
   * Verify email with token
   * @param {string} token
   */
  verifyEmail: async (token) => {
    const response = await apiClient.post("/api/auth/verify-email", {
      token,
    });
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async () => {
    const response = await apiClient.post("/api/auth/resend-verification-email");
    return response.data;
  },

  /**
   * Get current authenticated user info
   */
  getUserInfo: async () => {
    const response = await apiClient.get("/api/auth/user");
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await apiClient.post("/api/auth/logout");
    return response.data;
  },
};

export default authService;
