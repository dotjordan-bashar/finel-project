import axios from "axios";

// One axios instance for the whole app, pointing at our backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Before every request, attach the token if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get a readable error message from a failed request
export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export default api;
