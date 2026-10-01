import axios from 'axios';
import { STUDENT } from '../constants/student';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export const apiClient = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Student-Id'] = STUDENT.mssv;
    return config;
  },
  (error) => Promise.reject(error),
);

export const fetchProducts = async (category?: string): Promise<Product[]> => {
  const url = category && category !== 'all' 
    ? `/products/category/${encodeURIComponent(category)}`
    : '/products';
  const response = await apiClient.get<Product[]>(url);
  return response.data;
};

export const fetchCategories = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/products/categories');
  return response.data;
};

export const fetchProductDetail = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};
