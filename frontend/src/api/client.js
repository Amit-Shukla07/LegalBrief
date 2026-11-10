import axios from "axios";

let rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
rawBaseUrl = rawBaseUrl.trim().replace(/\/$/, "");
if (!rawBaseUrl.endsWith("/api")) {
  rawBaseUrl += "/api";
}

const api = axios.create({
  baseURL: rawBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lcms_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage =
      window.location.pathname === "/login" || window.location.pathname === "/register";

    // Only redirect to login if user is on a protected route and token expired (401)
    if (error.response && error.response.status === 401 && !isAuthPage) {
      localStorage.removeItem("lcms_token");
      localStorage.removeItem("lcms_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
