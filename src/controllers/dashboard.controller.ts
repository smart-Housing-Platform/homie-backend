import { Request, Response } from 'express';
import { PropertyModel } from '../models/property.model';
import { UserModel } from '../models/user.model';
import { ApplicationModel } from '../models/application.model';
import { NotificationModel } from '../models/notification.model';
import { TransactionModel } from '../models/transaction.model';

export class DashboardController {
  // Tenant Methods
  async getTenantStats(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const [savedProperties, applications, notifications] = await Promise.all([
        PropertyModel.find({ savedBy: userId }).count(),
        ApplicationModel.find({ tenantId: userId }).count(),
        NotificationModel.find({ userId, read: false }).count()
      ]);

      const stats = {
        totalProperties: savedProperties,
        activeListings: await PropertyModel.find({ status: 'available' }).count(),
        totalApplications: applications,
        pendingApplications: await ApplicationModel.find({ tenantId: userId, status: 'pending' }).count(),
        newNotifications: notifications
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tenant stats' });
    }
  }

  async getTenantSavedProperties(req: Request, res: Response) {
    try {
      const properties = await PropertyModel.find({ savedBy: req.user.id })
        .populate('landlordId', 'name email')
        .sort('-createdAt');
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching saved properties' });
    }
  }

  async getTenantApplications(req: Request, res: Response) {
    try {
      const applications = await ApplicationModel.find({ tenantId: req.user.id })
        .populate('propertyId')
        .populate('landlordId', 'name email')
        .sort('-createdAt');
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  }

  async getTenantNotifications(req: Request, res: Response) {
    try {
      const notifications = await NotificationModel.find({ userId: req.user.id })
        .sort('-createdAt');
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  }

  // Landlord Methods
  async getLandlordStats(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const [properties, applications, rentedProperties, totalIncome] = await Promise.all([
        PropertyModel.find({ landlordId: userId }).count(),
        ApplicationModel.find({ landlordId: userId }).count(),
        PropertyModel.find({ landlordId: userId, status: 'rented' }).count(),
        TransactionModel.aggregate([
          { $match: { landlordId: userId } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const stats = {
        totalProperties: properties,
        activeListings: await PropertyModel.find({ landlordId: userId, status: 'available' }).count(),
        totalIncome: totalIncome[0]?.total || 0,
        occupancyRate: properties > 0 ? Math.round((rentedProperties / properties) * 100) : 0,
        totalApplications: applications,
        pendingApplications: await ApplicationModel.find({ landlordId: userId, status: 'pending' }).count()
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching landlord stats' });
    }
  }

  async getLandlordProperties(req: Request, res: Response) {
    try {
      const properties = await PropertyModel.find({ landlordId: req.user.id })
        .sort('-createdAt');
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching properties' });
    }
  }

  async getLandlordApplications(req: Request, res: Response) {
    try {
      const applications = await ApplicationModel.find({ landlordId: req.user.id })
        .populate('propertyId')
        .populate('tenantId', 'name email')
        .sort('-createdAt');
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  }

  async getLandlordIncome(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      // Get monthly income data
      const monthly = await TransactionModel.aggregate([
        { $match: { landlordId: userId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            amount: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        {
          $project: {
            _id: 0,
            month: '$_id',
            amount: 1,
            transactions: 1
          }
        }
      ]);

      // Get recent transactions
      const transactions = await TransactionModel.find({ landlordId: userId })
        .populate('propertyId')
        .populate('tenantId', 'name email')
        .sort('-createdAt')
        .limit(10);

      res.json({
        monthly,
        transactions
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching income data' });
    }
  }

  // Admin Methods
  async getAdminStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalUsers, newUsers, properties, transactions, revenue] = await Promise.all([
        UserModel.find().count(),
        UserModel.find({ createdAt: { $gte: firstDayOfMonth } }).count(),
        PropertyModel.find().count(),
        TransactionModel.find().count(),
        TransactionModel.aggregate([
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const stats = {
        totalUsers,
        newUsersThisMonth: newUsers,
        totalProperties: properties,
        totalTransactions: transactions,
        revenue: revenue[0]?.total || 0
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching admin stats' });
    }
  }

  async getAdminUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.find()
        .select('-password')
        .sort('-createdAt');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  }

  async getAdminProperties(req: Request, res: Response) {
    try {
      const properties = await PropertyModel.find()
        .populate('landlordId', 'name email')
        .sort('-createdAt');
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching properties' });
    }
  }

  async getAdminTransactions(req: Request, res: Response) {
    try {
      const transactions = await TransactionModel.find()
        .populate('propertyId')
        .populate('tenantId', 'name email')
        .populate('landlordId', 'name email')
        .sort('-createdAt');
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions' });
    }
  }
} 