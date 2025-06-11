import mongoose from 'mongoose';
import { Property } from '../types';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  listingType: {
    type: String,
    enum: ['rent', 'sale'],
    required: true,
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null,
    },
    type: {
      type: String,
      enum: ['fixed', 'negotiable'],
      default: 'fixed',
    },
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  features: {
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    squareFeet: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyType: {
      type: String,
      required: true,
    },
    yearBuilt: Number,
    parking: {
      type: Number,
      default: 0,
      min: 0,
    },
    furnished: {
      type: Boolean,
      default: false,
    },
  },
  amenities: [{
    type: String,
  }],
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    }
  }],
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'sold', 'pending'],
    default: 'available',
  },
}, {
  timestamps: true,
});

// Add text index for search functionality
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
  'location.state': 'text',
});

export const PropertyModel = mongoose.model<Property & mongoose.Document>('Property', propertySchema); 