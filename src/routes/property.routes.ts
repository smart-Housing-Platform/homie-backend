import express from 'express';
import { auth, authorize } from '../middleware/auth.middleware';
import {
  createProperty,
  updateProperty,
  deleteProperty,
  getProperties,
  getProperty,
  saveProperty,
  unsaveProperty,
  isPropertySaved,
} from '../controllers/property.controller';
import { upload } from '../config/cloudinary';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes (landlord only)
router.post('/', auth, authorize('landlord'), upload.array('images', 10), createProperty);
router.put('/:id', auth, authorize('landlord'), upload.array('images', 10), updateProperty);
router.delete('/:id', auth, authorize('landlord'), deleteProperty);

// Save/unsave routes (tenant only)
router.post('/:id/save', auth, authorize('tenant'), saveProperty);
router.delete('/:id/save', auth, authorize('tenant'), unsaveProperty);
router.get('/:id/saved', auth, authorize('tenant'), isPropertySaved);

export default router; 