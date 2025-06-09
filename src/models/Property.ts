import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
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
  };
  amenities: string[];
  images: Array<{
    url: string;
    publicId: string;
  }>;
  landlordId: mongoose.Types.ObjectId;
  status: 'available' | 'rented' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
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
    },
    amenities: [{ type: String }],
    images: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }],
    landlordId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['available', 'rented', 'pending'],
      default: 'available',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', PropertySchema); 