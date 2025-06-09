import { Request, Response } from 'express';
import { ApplicationModel } from '../models/application.model';
import { PropertyModel } from '../models/property.model';

// Submit a rental application
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.body;
    const tenantId = req.user._id;

    // Check if property exists and is available
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for rent' });
    }

    // Check if user has already applied
    const existingApplication = await ApplicationModel.findOne({ propertyId, tenantId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this property' });
    }

    const application = new ApplicationModel({
      propertyId,
      tenantId,
      status: 'pending',
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application' });
  }
};

// Get applications for a tenant
export const getTenantApplications = async (req: Request, res: Response) => {
  try {
    const applications = await ApplicationModel.find({ tenantId: req.user._id })
      .populate('propertyId')
      .sort({ submittedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Get applications for a landlord's properties
export const getLandlordApplications = async (req: Request, res: Response) => {
  try {
    // Get all properties owned by the landlord
    const properties = await PropertyModel.find({ landlordId: req.user._id });
    const propertyIds = properties.map(property => property._id);

    // Get all applications for these properties
    const applications = await ApplicationModel.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId')
      .populate('tenantId', 'name email')
      .sort({ submittedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Update application status (landlord only)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const application = await ApplicationModel.findById(id)
      .populate('propertyId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the property belongs to the landlord
    const property = application.propertyId as any;
    if (property.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    // Update application status
    application.status = status;
    await application.save();

    // If approved, update property status
    if (status === 'approved') {
      property.status = 'rented';
      await property.save();

      // Reject all other pending applications for this property
      await ApplicationModel.updateMany(
        {
          propertyId: property._id,
          _id: { $ne: application._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status' });
  }
};