export interface UserCardProps {
  item: User;
  onToggleGender: (userId: number, newGender: 'male' | 'female') => void;
  onPress?: () => void;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  email: string;
  role: string;
  company?: {
    title?: string;
    name?: string;
  };
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female';
  role?: string;
  image?: string;
  company?: {
    title?: string;
    name?: string;
  };
}

export interface FetchPhotosResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail: string;
  images: string[];
}

export interface SearchProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}