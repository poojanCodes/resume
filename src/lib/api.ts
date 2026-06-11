import axios from "axios";

/**
 * Centralized Axios instance for the AI Resume Builder.
 *
 * Key config:
 * - withCredentials: true  → Tells the browser to include HTTP-only cookies
 *   (where our JWT lives) on every request. Without this, the cookie is
 *   silently dropped and the backend will return 401.
 * - baseURL               → All requests use relative paths like "/api/..."
 *   which Next.js resolves to the same origin automatically.
 */
const api = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor — global 401 handler.
 *
 * If any API call returns 401 (token expired / not logged in),
 * we redirect to login. This means individual pages don't need to
 * manually handle auth expiry.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
