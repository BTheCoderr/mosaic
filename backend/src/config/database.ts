import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Match } from '../models/Match';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mosaic_db',
  synchronize: process.env.NODE_ENV === 'development', // Auto-create database tables in development
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Match, Message, Profile],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}; 