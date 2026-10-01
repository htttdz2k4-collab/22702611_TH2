import axios from 'axios';
import { STUDENT } from '../constants/student';

export const axiosClient = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    config.headers['X-Student-Id'] = STUDENT.mssv;
    return config;
  },
  (error) => Promise.reject(error),
);

export const apiClient = axiosClient;
