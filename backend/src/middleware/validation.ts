import { Request, Response, NextFunction } from 'express';
import { Gender } from '../models/Profile';

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username, firstName, dateOfBirth, gender } = req.body;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  // Username validation (3-20 characters, alphanumeric and underscores only)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!username || !usernameRegex.test(username)) {
    return res.status(400).json({
      error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
    });
  }

  // First name validation
  if (!firstName || firstName.length < 2) {
    return res.status(400).json({ error: 'First name is required and must be at least 2 characters long' });
  }

  // Date of birth validation (must be at least 18 years old)
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (!dateOfBirth || age < 18) {
    return res.status(400).json({ error: 'You must be at least 18 years old to register' });
  }

  // Gender validation
  if (!gender || !Object.values(Gender).includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender selection' });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

export const validatePasswordReset = (req: Request, res: Response, next: NextFunction) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  next();
}; 