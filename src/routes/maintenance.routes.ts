import * as express from 'express';
import { createMaintenanceRequest, getTenantMaintenanceRequests, getLandlordMaintenanceRequests, updateMaintenanceStatus } from '../controllers/maintenance.controller';
import { auth, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Tenant routes
router.post('/', auth, authorize('tenant'), createMaintenanceRequest);
router.get('/tenant', auth, authorize('tenant'), getTenantMaintenanceRequests);

// Landlord routes
router.get('/landlord', auth, authorize('landlord'), getLandlordMaintenanceRequests);
router.put('/:id/status', auth, authorize('landlord'), updateMaintenanceStatus);

export default router;