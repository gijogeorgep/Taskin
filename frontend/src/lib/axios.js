import axios from "axios";

axios.defaults.withCredentials = true;

export const axiosInstance = axios.create({
  baseURL: " https://taskin-backend-k1w8.onrender.com/api",

  withCredentials: true,
});
