import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL || '';

const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('passenger_token') || localStorage.getItem('user_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await fetch(`${baseURL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // credentials: 'include'
        });
        if (!refreshRes.ok) {
          localStorage.removeItem('passenger_token');
          return Promise.reject(error);
        }
        const refreshData = await refreshRes.json();
        const newToken = refreshData?.access_token || refreshData?.accessToken || refreshData?.token;
        if (newToken) {
          localStorage.setItem('passenger_token', newToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem('passenger_token');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
