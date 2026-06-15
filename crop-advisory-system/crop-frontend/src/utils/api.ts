import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fallback to local dev API URL, detect OS for emulator compatibility
// Android emulator uses 10.0.2.2, iOS and Web can use localhost
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: 'https://pdd-1-paz9.onrender.com/api',
  timeout: 60000,
});

// Auto attach JWT token to every request
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error reading token from AsyncStorage', error);
  }
  return config;
});

// Response interceptor for session expiration handling
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error clearing auth storage', e);
      }
    }
    return Promise.reject(err);
  }
);

export default API;
export { DEV_URL };
