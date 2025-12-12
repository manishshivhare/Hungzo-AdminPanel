import axios from 'axios';

// const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const API_BASE = "https://api.dhafoods.com/api";



const API = axios.create({
  baseURL: API_BASE,
});

// Add Authorization header to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // get token from storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});