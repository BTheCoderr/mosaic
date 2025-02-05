import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: Gender,
    array: true,
    default: Object.values(Gender),
  })
  interestedIn: Gender[];

  // Cultural and Background Information
  @Column({ nullable: true })
  culturalBackground: string;

  @Column('simple-array', { nullable: true })
  languages: string[];

  @Column({ nullable: true })
  religion: string;

  @Column({ nullable: true })
  spirituality: string;

  @Column('simple-array', { nullable: true })
  values: string[];

  @Column({ nullable: true })
  communityInvolvement: string;

  @Column({ type: 'text', nullable: true })
  culturalTraditions: string;

  @Column({ type: 'text', nullable: true })
  familyBackground: string;

  // Personal Expression
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column('simple-array', { nullable: true })
  musicTaste: string[];

  @Column('simple-array', { nullable: true })
  cuisinePreferences: string[];

  @Column('simple-array', { nullable: true })
  artsCulture: string[];

  // Location and Preferences
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 50 })
  searchRadius: number;

  @Column({ default: true })
  isActive: boolean;

  // Lifestyle & Interests
  @Column('json', { nullable: true })
  lifestyle: {
    socialStyle: string;
    leisureActivities: string[];
    travelExperience: string[];
    foodPreferences: string[];
    musicTaste: string[];
    languages: string[];
  };

  // Values & Background
  @Column('json', { nullable: true })
  personalValues: {
    importantTraits: string[];
    lifeGoals: string[];
    familyViews: number; // 1-5 scale
    traditionViews: number; // 1-5 scale
    spirituality: number; // 1-5 scale
    communityImportance: number; // 1-5 scale
  };

  // Preferences & Interests
  @Column('json', { nullable: true })
  preferences: {
    dateIdeas: string[];
    sharedActivities: string[];
    learningInterests: string[];
    cuisineInterests: string[];
    artsCulture: string[];
    outdoorActivities: string[];
  };

  // Experience & Background
  @Column('json', { nullable: true })
  background: {
    hometown: string;
    placesLived: string[];
    languages: {
      fluent: string[];
      learning: string[];
      interested: string[];
    };
    culturalExperience: string[];
    educationField: string;
  };

  // Matching Preferences
  @Column('json', { nullable: true })
  matchPreferences: {
    distancePreference: number;
    ageRange: { min: number; max: number };
    dealBreakers: string[];
    mustHaves: string[];
    openToLongDistance: boolean;
    preferredLanguages: string[];
  };

  // Cultural Preferences
  @Column('json', { nullable: true })
  culturalPreferences: {
    // Food & Cuisine
    foodPreference: string;
    dietaryRestrictions: string[];
    cookingInterest: number; // 1-5 scale
    
    // Music & Arts
    musicPreference: string[];
    artInterests: string[];
    performingArts: string[];
    
    // Social & Lifestyle
    socialStyle: string;
    familyValues: number; // 1-5 scale
    communityImportance: number; // 1-5 scale
    
    // Cultural Values
    traditionImportance: number; // 1-5 scale
    opennessToDiversity: number; // 1-5 scale
    religiousImportance: number; // 1-5 scale
    
    // Learning & Exchange
    languageExchangeInterest: boolean;
    culturalExchangePreferences: string[];
    learningInterests: string[];
  };

  @Column('json', { nullable: true })
  culturalActivitiesPreference: {
    indoor: string[];
    outdoor: string[];
    social: string[];
    creative: string[];
    educational: string[];
  };

  @Column('simple-array', { nullable: true })
  favoriteEvents: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field for age calculation
  get age(): number {
    return new Date().getFullYear() - new Date(this.dateOfBirth).getFullYear();
  }
} 