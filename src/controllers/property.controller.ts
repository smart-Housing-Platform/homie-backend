import { Request, Response } from 'express';
import { PropertyModel } from '../models/property.model';
import { PropertyFilter } from '../types';
import cloudinary from '../config/cloudinary';

// Create a new property
export const createProperty = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Extract image URLs and public IDs from the uploaded files
    const images = files.map((file: any) => ({
      url: file.path,
      publicId: file.filename
    }));

    const propertyData = {
      ...req.body,
      landlordId: req.user._id,
      images
    };

    // Parse JSON strings in the request body
    if (typeof propertyData.location === 'string') {
      propertyData.location = JSON.parse(propertyData.location);
    }
    if (typeof propertyData.features === 'string') {
      propertyData.features = JSON.parse(propertyData.features);
    }
    if (typeof propertyData.amenities === 'string') {
      propertyData.amenities = JSON.parse(propertyData.amenities);
    }

    const property = new PropertyModel(propertyData);
    await property.save();

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Error creating property' });
  }
};

// Get all properties with filters
export const getProperties = async (req: Request, res: Response) => {
  try {
    const filter: PropertyFilter = req.query;
    const query: any = {};

    if (filter.location) {
      query.$or = [
        { 'location.address': { $regex: filter.location, $options: 'i' } },
        { 'location.city': { $regex: filter.location, $options: 'i' } },
        { 'location.state': { $regex: filter.location, $options: 'i' } },
      ];
    }

    if (filter.minPrice) query.price = { $gte: filter.minPrice };
    if (filter.maxPrice) query.price = { ...query.price, $lte: filter.maxPrice };
    if (filter.bedrooms) query['features.bedrooms'] = filter.bedrooms;
    if (filter.bathrooms) query['features.bathrooms'] = filter.bathrooms;
    if (filter.propertyType) query['features.propertyType'] = filter.propertyType;
    if (filter.amenities) query.amenities = { $all: filter.amenities };

    const properties = await PropertyModel.find(query).populate('landlordId', 'name email');
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

// Get a single property
export const getProperty = async (req: Request, res: Response) => {
  try {
    const property = await PropertyModel.findById(req.params.id).populate('landlordId', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Error fetching property' });
  }
};

// Update a property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const property = await PropertyModel.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.landlordId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updateData = { ...req.body };

    // Handle new image uploads
    if (files && files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of property.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      // Add new images
      updateData.images = files.map((file: any) => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    // Parse JSON strings in the request body
    if (typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }
    if (typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }
    if (typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }

    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Error updating property' });
  }
};

// Delete a property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await PropertyModel.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.landlordId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    // Delete images from Cloudinary
    for (const image of property.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await PropertyModel.findByIdAndDelete(id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Error deleting property' });
  }
}; 