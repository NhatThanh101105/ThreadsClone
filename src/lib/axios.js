import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  "https://threads.f8team.dev";

export const apiClient = axios.create({
  baseURL,
});

// Request interceptor: attach Authorization header and x-origin
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // If request data is FormData, remove Content-Type so browser/axios can attach multipart/form-data boundary automatically
  if (config.data instanceof FormData) {
    if (config.headers?.delete) {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
    }
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  // Header x-origin is required by API for verification & reset password links
  if (typeof window !== "undefined" && window.location?.origin) {
    config.headers["x-origin"] = window.location.origin;
  }

  return config;
});

// Refresh token queue management
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

// Response interceptor: auto refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh if request has no config or already retried
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    const isAuthLogin = url.includes("/auth/login");
    const isAuthRefresh = url.includes("/auth/refresh");

    // Rule: Bỏ qua /auth/login và /auth/refresh
    if (isAuthLogin || isAuthRefresh) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedRefreshToken = localStorage.getItem("refresh_token");

      // If no refresh token available, clear and redirect to login
      if (!storedRefreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue parallel requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint directly with baseURL
        const response = await axios.post(
          `${baseURL}/api/auth/refresh`,
          { refresh_token: storedRefreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data?.data || response.data;
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        if (newAccessToken) {
          localStorage.setItem("access_token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
          }

          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error("No access_token returned from refresh");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
