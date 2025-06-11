import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { SignOptions } from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new UserModel({
      email,
      password,
      name,
      role,
    });

    await user.save();

    // Generate token
    const signOptions: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      signOptions
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const signOptions: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      signOptions
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
}; 