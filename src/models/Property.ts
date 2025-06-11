import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  listingType: 'rent' | 'sale';
  price: {
    amount: number;
    frequency?: 'monthly' | 'yearly' | null; // for rentals
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
  landlordId: mongoose.Types.ObjectId;
  status: 'available' | 'rented' | 'sold' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    listingType: { 
      type: String, 
      enum: ['rent', 'sale'], 
      required: true 
    },
    price: {
      amount: { type: Number, required: true },
      frequency: { 
        type: String, 
        enum: ['monthly', 'yearly', null],
        default: null
      },
      type: { 
        type: String, 
        enum: ['fixed', 'negotiable'],
        default: 'fixed'
      }
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    features: {
      bedrooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
      squareFeet: { type: Number, required: true },
      propertyType: { type: String, required: true },
      yearBuilt: { type: Number },
      parking: { type: Number, default: 0 },
      furnished: { type: Boolean, default: false }
    },
    amenities: [{ type: String }],
    images: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }],
    landlordId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['available', 'rented', 'sold', 'pending'],
      default: 'available',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', PropertySchema); 