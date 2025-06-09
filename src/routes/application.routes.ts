import * as express from 'express';
import { submitApplication, getTenantApplications, getLandlordApplications, updateApplicationStatus } from '../controllers/application.controller';
import { auth, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Tenant routes
router.post('/', auth, authorize('tenant'), submitApplication);
router.get('/tenant', auth, authorize('tenant'), getTenantApplications);

// Landlord routes
router.get('/landlord', auth, authorize('landlord'), getLandlordApplications);
router.put('/:id/status', auth, authorize('landlord'), updateApplicationStatus);

export default router; 