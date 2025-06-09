import mongoose from 'mongoose';
import { ApplicationStatus } from '../types';

const applicationSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure one application per property per tenant
applicationSchema.index({ propertyId: 1, tenantId: 1 }, { unique: true });

export const ApplicationModel = mongoose.model<ApplicationStatus & mongoose.Document>('Application', applicationSchema); 