import { Request, Response } from 'express';
import { PropertyModel } from '../models/property.model';
import { PropertyFilter } from '../types';
import cloudinary from '../config/cloudinary';
import { UserModel } from '../models/user.model';

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
    if (typeof propertyData.price === 'string') {
      propertyData.price = JSON.parse(propertyData.price);
    }

    // Validate required fields
    if (!propertyData.listingType || !['rent', 'sale'].includes(propertyData.listingType)) {
      return res.status(400).json({ message: 'Invalid listing type' });
    }

    // Validate price structure
    if (!propertyData.price || typeof propertyData.price.amount !== 'number' || propertyData.price.amount <= 0) {
      return res.status(400).json({ message: 'Invalid price amount' });
    }

    if (propertyData.listingType === 'rent' && !propertyData.price.frequency) {
      return res.status(400).json({ message: 'Payment frequency is required for rental properties' });
    }

    // Validate numeric values in features
    if (propertyData.features) {
      if (isNaN(propertyData.features.bedrooms) || propertyData.features.bedrooms < 0) {
        return res.status(400).json({ message: 'Invalid bedrooms value' });
      }
      if (isNaN(propertyData.features.bathrooms) || propertyData.features.bathrooms < 0) {
        return res.status(400).json({ message: 'Invalid bathrooms value' });
      }
      if (isNaN(propertyData.features.squareFeet) || propertyData.features.squareFeet <= 0) {
        return res.status(400).json({ message: 'Invalid square feet value' });
      }
      if (propertyData.features.yearBuilt && (isNaN(propertyData.features.yearBuilt) || 
          propertyData.features.yearBuilt < 1800 || 
          propertyData.features.yearBuilt > new Date().getFullYear())) {
        return res.status(400).json({ message: 'Invalid year built value' });
      }
      if (isNaN(propertyData.features.parking) || propertyData.features.parking < 0) {
        return res.status(400).json({ message: 'Invalid parking spaces value' });
      }
    }

    const property = new PropertyModel(propertyData);
    await property.save();

    res.status(201).json(property);
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map((err: any) => err.message) 
      });
    }

    // Handle other specific errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate property data' });
    }

    res.status(500).json({ 
      message: 'Error creating property',
      error: error.message
    });
  }
};

// Get all properties with filters
export const getProperties = async (req: Request, res: Response) => {
  try {
    const filter: PropertyFilter = req.query;
    const query: any = {};

    // Location filter
    if (filter.location) {
      query.$or = [
        { 'location.address': { $regex: filter.location, $options: 'i' } },
        { 'location.city': { $regex: filter.location, $options: 'i' } },
        { 'location.state': { $regex: filter.location, $options: 'i' } },
      ];
    }

    // Listing type filter
    if (filter.listingType) {
      query.listingType = filter.listingType;
    }

    // Price filter
    if (filter.minPrice || filter.maxPrice) {
      query['price.amount'] = {};
      if (filter.minPrice) query['price.amount'].$gte = filter.minPrice;
      if (filter.maxPrice) query['price.amount'].$lte = filter.maxPrice;
    }

    // Price frequency filter (for rentals)
    if (filter.priceFrequency) {
      query['price.frequency'] = filter.priceFrequency;
    }

    // Features filters
    if (filter.bedrooms) query['features.bedrooms'] = filter.bedrooms;
    if (filter.bathrooms) query['features.bathrooms'] = filter.bathrooms;
    if (filter.propertyType) query['features.propertyType'] = filter.propertyType;
    if (filter.furnished !== undefined) query['features.furnished'] = filter.furnished;

    // Amenities filter
    if (filter.amenities) {
      query.amenities = { $all: filter.amenities };
    }

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

    if (property.landlordId.toString() !== req.user._id.toString()) {
      console.log('Authorization failed:', {
        propertyLandlordId: property.landlordId.toString(),
        requestUserId: req.user._id.toString(),
        match: property.landlordId.toString() === req.user._id.toString()
      });
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updateData = { ...req.body };

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
    if (typeof updateData.price === 'string') {
      updateData.price = JSON.parse(updateData.price);
    }

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
    console.log('Delete property request:', {
      propertyId: id,
      userId: req.user._id,
      userRole: req.user.role
    });

    const property = await PropertyModel.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    console.log('Property found:', {
      propertyId: property._id,
      landlordId: property.landlordId.toString(),
      userId: req.user._id.toString()
    });

    if (property.landlordId.toString() !== req.user._id.toString()) {
      console.log('Authorization failed:', {
        propertyLandlordId: property.landlordId.toString(),
        requestUserId: req.user._id.toString(),
        match: property.landlordId.toString() === req.user._id.toString()
      });
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

// Save a property
export const saveProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if property exists
    const property = await PropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Add property to user's saved properties if not already saved
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.savedProperties.includes(property._id)) {
      return res.status(400).json({ message: 'Property already saved' });
    }

    user.savedProperties.push(property._id);
    await user.save();

    res.json({ message: 'Property saved successfully' });
  } catch (error) {
    console.error('Error saving property:', error);
    res.status(500).json({ message: 'Error saving property' });
  }
};

// Unsave a property
export const unsaveProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if property exists
    const property = await PropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Remove property from user's saved properties
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const propertyIndex = user.savedProperties.indexOf(property._id);
    if (propertyIndex === -1) {
      return res.status(400).json({ message: 'Property not in saved list' });
    }

    user.savedProperties.splice(propertyIndex, 1);
    await user.save();

    res.json({ message: 'Property removed from saved list' });
  } catch (error) {
    console.error('Error unsaving property:', error);
    res.status(500).json({ message: 'Error removing property from saved list' });
  }
};

// Check if a property is saved
export const isPropertySaved = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSaved = user.savedProperties.includes(id);
    res.json({ saved: isSaved });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({ message: 'Error checking saved status' });
  }
}; 