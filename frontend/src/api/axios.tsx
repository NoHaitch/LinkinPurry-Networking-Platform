import axios from "axios";
// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Add a response interceptor to handle 401 (Unauthorized) --> JWT token expired
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { status } = error.response;
    if (status === 401) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
