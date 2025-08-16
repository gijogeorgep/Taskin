import axios from "axios";

axios.defaults.withCredentials = true;

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",

  withCredentials: true,
});
