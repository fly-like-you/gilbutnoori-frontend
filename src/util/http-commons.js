import axios from "axios";

const localAxios = () => {
  const instance = axios.create({
    baseURL: process.env.VUE_APP_API_URL || "http://localhost:8080",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  // Request 인터셉터 추가
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).token
        : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response 인터셉터 추가
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const response = await instance.post("/auth/refresh", {
            refreshToken: user.refreshToken
          });
          const newToken = response.data.token;
          const updatedUser = { ...user, token: newToken };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export { localAxios };