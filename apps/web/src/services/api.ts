import axios from "axios";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLogin = originalRequest?.url?.includes("/auth/login"); // ← corrigido

    if (isLogin) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
