import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../config/redis';

const userRepository = AppDataSource.getRepository(User);
const profileRepository = AppDataSource.getRepository(Profile);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, firstName, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password; // Will be hashed by @BeforeInsert

    // Create user profile
    const profile = new Profile();
    profile.firstName = firstName;
    profile.dateOfBirth = new Date(dateOfBirth);
    profile.gender = gender;

    // Save user and profile
    const savedUser = await userRepository.save(user);
    profile.user = savedUser;
    await profileRepository.save(profile);

    // Generate verification token
    const verificationToken = uuidv4();
    await redis.set(`verify:${verificationToken}`, user.id, 'EX', 24 * 60 * 60); // 24 hours expiry

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userRepository.findOne({
      where: { email },
      relations: ['profile']
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await userRepository.save(user);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Get user id from redis
    const userId = await redis.get(`verify:${token}`);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.emailVerified = true;
    await userRepository.save(user);
    
    // Delete token
    await redis.del(`verify:${token}`);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const user = await userRepository.findOneBy({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    await redis.set(`reset:${resetToken}`, user.id, 'EX', 60 * 60); // 1 hour expiry

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    // Get user id from redis
    const userId = await redis.get(`reset:${token}`);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await userRepository.save(user);
    
    // Delete token
    await redis.del(`reset:${token}`);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
}; 