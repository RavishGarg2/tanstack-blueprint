import axios from 'axios';
import {
  FetchPhotosResponse,
  SearchProductsResponse,
  User,
  Product,
  CreateUserInput,
} from './types';

const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 5000,
});

const fetchPhotos = async (
  limit: number = 10,
  skip: number = 0,
): Promise<FetchPhotosResponse> => {
  const response = await apiClient.get<FetchPhotosResponse>(
    `/users?limit=${limit}&skip=${skip}`,
  );
  return response.data;
};

const createUser = async (userData: CreateUserInput): Promise<User> => {
  const response = await apiClient.post<User>('/users/add', userData);
  return response.data;
};

const updateUserGender = async (
  userId: number,
  newGender: 'male' | 'female',
): Promise<User> => {
  const response = await apiClient.patch<User>(`/users/${userId}`, {
    gender: newGender,
  });
  return response.data;
};

const fetchUserById = async (userId: number): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
};

const fetchProductById = async (productId: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${productId}`);
  return response.data;
};

const searchProducts = async (
  query: string,
  limit: number = 20,
  skip: number = 0,
): Promise<SearchProductsResponse> => {
  const response = await apiClient.get<SearchProductsResponse>(
    `/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
  );
  return response.data;
};

export {
  apiClient,
  fetchPhotos,
  createUser,
  updateUserGender,
  fetchUserById,
  fetchProductById,
  searchProducts,
};
