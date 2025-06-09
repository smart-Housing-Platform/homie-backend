import { Request, Response } from 'express';
import { MaintenanceModel } from '../models/maintenance.model';
import { PropertyModel } from '../models/property.model';

// Create a maintenance request
export const createMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    const { propertyId, title, description, priority } = req.body;
    const tenantId = req.user._id;

    // Verify the property exists
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create maintenance request
    const maintenanceRequest = new MaintenanceModel({
      propertyId,
      tenantId,
      title,
      description,
      priority,
      status: 'pending',
    });

    await maintenanceRequest.save();
    res.status(201).json(maintenanceRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating maintenance request' });
  }
};

// Get maintenance requests for a tenant
export const getTenantMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    const requests = await MaintenanceModel.find({ tenantId: req.user._id })
      .populate('propertyId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance requests' });
  }
};

// Get maintenance requests for a landlord's properties
export const getLandlordMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    // Get all properties owned by the landlord
    const properties = await PropertyModel.find({ landlordId: req.user._id });
    const propertyIds = properties.map(property => property._id);

    // Get all maintenance requests for these properties
    const requests = await MaintenanceModel.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId')
      .populate('tenantId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance requests' });
  }
};

// Update maintenance request status (landlord only)
export const updateMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const request = await MaintenanceModel.findById(id)
      .populate('propertyId');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Verify the property belongs to the landlord
    const property = request.propertyId as any;
    if (property.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Update request status
    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating maintenance request status' });
  }
}; 