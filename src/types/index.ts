export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'admin';
  profileImage?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  listingType: 'rent' | 'sale';
  price: {
    amount: number;
    frequency?: 'monthly' | 'yearly' | null;
    type: 'fixed' | 'negotiable';
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    propertyType: string;
    yearBuilt?: number;
    parking?: number;
    furnished: boolean;
  };
  amenities: string[];
  images: Array<{
    url: string;
    publicId: string;
  }>;
  landlordId: string;
  status: 'available' | 'rented' | 'sold' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFilter {
  location?: string;
  listingType?: 'rent' | 'sale';
  minPrice?: number;
  maxPrice?: number;
  priceFrequency?: 'monthly' | 'yearly';
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  amenities?: string[];
  furnished?: boolean;
}

export interface ApplicationStatus {
  id: string;
  propertyId: string;
  tenantId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: string;
} 