import { Router } from 'express';
import { auth, authorize } from '../middleware/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const controller = new DashboardController();

// Tenant routes
router.get('/tenant/stats', auth, authorize('tenant'), controller.getTenantStats);
router.get('/tenant/saved-properties', auth, authorize('tenant'), controller.getTenantSavedProperties);
router.get('/tenant/applications', auth, authorize('tenant'), controller.getTenantApplications);
router.get('/tenant/notifications', auth, authorize('tenant'), controller.getTenantNotifications);

// Landlord routes
router.get('/landlord/stats', auth, authorize('landlord'), controller.getLandlordStats);
router.get('/landlord/properties', auth, authorize('landlord'), controller.getLandlordProperties);
router.get('/landlord/applications', auth, authorize('landlord'), controller.getLandlordApplications);
router.get('/landlord/income', auth, authorize('landlord'), controller.getLandlordIncome);

// Admin routes
router.get('/admin/stats', auth, authorize('admin'), controller.getAdminStats);
router.get('/admin/users', auth, authorize('admin'), controller.getAdminUsers);
router.get('/admin/properties', auth, authorize('admin'), controller.getAdminProperties);
router.get('/admin/transactions', auth, authorize('admin'), controller.getAdminTransactions);

export default router; 