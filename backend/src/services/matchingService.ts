import { Profile } from '../models/Profile';
import { AppDataSource } from '../config/database';

interface MatchScore {
  score: number;
  reasons: string[];
}

export class MatchingService {
  private static readonly DISTANCE_WEIGHT = 0.2;
  private static readonly CULTURAL_WEIGHT = 0.4;
  private static readonly LANGUAGE_WEIGHT = 0.2;
  private static readonly VALUES_WEIGHT = 0.2;

  private static readonly CULTURAL_EVENTS = {
    food: [
      'Food festivals',
      'Cooking classes',
      'Restaurant exploration',
      'Cultural food markets',
      'Wine/Tea tasting events',
      'Food photography workshops'
    ],
    music: [
      'Concert events',
      'Cultural music festivals',
      'Dance workshops',
      'Music instrument lessons',
      'Traditional music performances',
      'Cultural dance nights'
    ],
    social: [
      'Cultural meetups',
      'Community events',
      'Language exchange meetups',
      'Cultural exchange gatherings',
      'International social clubs',
      'Cultural networking events'
    ],
    traditional: [
      'Traditional ceremonies',
      'Cultural celebrations',
      'Heritage sites visits',
      'Cultural workshops',
      'Traditional craft classes',
      'Cultural festivals'
    ],
    arts: [
      'Art gallery visits',
      'Museum tours',
      'Theater performances',
      'Cultural film screenings',
      'Art workshops',
      'Photography walks'
    ],
    educational: [
      'Cultural history talks',
      'Language classes',
      'Cultural workshops',
      'Book clubs',
      'Cultural documentary screenings',
      'Cultural cooking demonstrations'
    ],
    outdoor: [
      'Cultural garden visits',
      'Cultural walking tours',
      'Traditional sports events',
      'Cultural markets',
      'Outdoor festivals',
      'Cultural nature walks'
    ]
  };

  private static readonly WEIGHTS = {
    lifestyle: 0.25,
    values: 0.30,
    interests: 0.25,
    background: 0.20
  };

  private static readonly ACTIVITIES = {
    dining: [
      'Local food exploration',
      'Cooking together',
      'Food markets',
      'Wine tasting',
      'International cuisine night',
      'Street food adventure'
    ],
    cultural: [
      'Art exhibitions',
      'Live performances',
      'Cultural festivals',
      'Museum visits',
      'Language exchange',
      'Cultural workshops'
    ],
    outdoor: [
      'City exploration',
      'Nature walks',
      'Beach activities',
      'Park picnics',
      'Photography walks',
      'Garden visits'
    ],
    social: [
      'Community events',
      'Group activities',
      'Social clubs',
      'Dance classes',
      'Volunteer together',
      'Sports activities'
    ],
    learning: [
      'Cooking classes',
      'Art workshops',
      'Language learning',
      'Dance lessons',
      'Music appreciation',
      'Cultural history'
    ]
  };

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private static calculateCulturalScore(profile1: Profile, profile2: Profile): MatchScore {
    const reasons: string[] = [];
    let score = 0;

    if (!profile1.culturalPreferences || !profile2.culturalPreferences) {
      return { score: 0, reasons: ['Cultural preferences not specified'] };
    }

    // Food & Cuisine Compatibility (15% weight)
    const foodScore = this.calculateFoodCompatibility(profile1.culturalPreferences, profile2.culturalPreferences);
    score += foodScore.score * 0.15;
    reasons.push(...foodScore.reasons);

    // Music & Arts Compatibility (15% weight)
    const artsScore = this.calculateArtsCompatibility(profile1.culturalPreferences, profile2.culturalPreferences);
    score += artsScore.score * 0.15;
    reasons.push(...artsScore.reasons);

    // Social & Lifestyle Compatibility (20% weight)
    const socialScore = this.calculateSocialCompatibility(profile1.culturalPreferences, profile2.culturalPreferences);
    score += socialScore.score * 0.20;
    reasons.push(...socialScore.reasons);

    // Cultural Values Compatibility (30% weight)
    const valuesScore = this.calculateValuesCompatibility(profile1.culturalPreferences, profile2.culturalPreferences);
    score += valuesScore.score * 0.30;
    reasons.push(...valuesScore.reasons);

    // Learning & Exchange Compatibility (20% weight)
    const learningScore = this.calculateLearningCompatibility(profile1.culturalPreferences, profile2.culturalPreferences);
    score += learningScore.score * 0.20;
    reasons.push(...learningScore.reasons);

    return {
      score: Math.min(score, 1),
      reasons: reasons.slice(0, 5) // Limit to top 5 most relevant reasons
    };
  }

  private static calculateFoodCompatibility(prefs1: any, prefs2: any): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    // Direct food preference match
    if (prefs1.foodPreference === prefs2.foodPreference) {
      score += 0.4;
      reasons.push('Similar food preferences');
    }

    // Cooking interest compatibility
    const cookingDiff = Math.abs(prefs1.cookingInterest - prefs2.cookingInterest);
    if (cookingDiff <= 1) {
      score += 0.3;
      reasons.push('Compatible cooking interests');
    }

    // Dietary restrictions consideration
    const compatibleDiet = this.areRestrictionsCompatible(
      prefs1.dietaryRestrictions,
      prefs2.dietaryRestrictions
    );
    if (compatibleDiet) {
      score += 0.3;
      reasons.push('Compatible dietary preferences');
    }

    return { score, reasons };
  }

  private static calculateArtsCompatibility(prefs1: any, prefs2: any): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    // Music preferences overlap
    const commonMusic = this.calculateArrayOverlap(
      prefs1.musicPreference,
      prefs2.musicPreference
    );
    score += commonMusic.score * 0.4;
    if (commonMusic.score > 0) {
      reasons.push('Shared music interests');
    }

    // Art interests overlap
    const commonArts = this.calculateArrayOverlap(
      prefs1.artInterests,
      prefs2.artInterests
    );
    score += commonArts.score * 0.3;
    if (commonArts.score > 0) {
      reasons.push('Shared art interests');
    }

    // Performing arts overlap
    const commonPerforming = this.calculateArrayOverlap(
      prefs1.performingArts,
      prefs2.performingArts
    );
    score += commonPerforming.score * 0.3;
    if (commonPerforming.score > 0) {
      reasons.push('Shared interest in performing arts');
    }

    return { score, reasons };
  }

  private static calculateSocialCompatibility(prefs1: any, prefs2: any): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    // Social style compatibility
    if (prefs1.socialStyle === prefs2.socialStyle) {
      score += 0.4;
      reasons.push('Compatible social styles');
    }

    // Family values alignment
    const familyDiff = Math.abs(prefs1.familyValues - prefs2.familyValues);
    if (familyDiff <= 1) {
      score += 0.3;
      reasons.push('Similar family values');
    }

    // Community importance alignment
    const communityDiff = Math.abs(prefs1.communityImportance - prefs2.communityImportance);
    if (communityDiff <= 1) {
      score += 0.3;
      reasons.push('Similar community values');
    }

    return { score, reasons };
  }

  private static calculateValuesCompatibility(prefs1: any, prefs2: any): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    // Tradition importance alignment
    const traditionDiff = Math.abs(prefs1.traditionImportance - prefs2.traditionImportance);
    if (traditionDiff <= 1) {
      score += 0.3;
      reasons.push('Similar views on traditions');
    }

    // Openness to diversity
    const opennessDiff = Math.abs(prefs1.opennessToDiversity - prefs2.opennessToDiversity);
    if (opennessDiff <= 1) {
      score += 0.4;
      reasons.push('Compatible openness to cultural diversity');
    }

    // Religious importance alignment
    const religiousDiff = Math.abs(prefs1.religiousImportance - prefs2.religiousImportance);
    if (religiousDiff <= 1) {
      score += 0.3;
      reasons.push('Compatible religious views');
    }

    return { score, reasons };
  }

  private static calculateLearningCompatibility(prefs1: any, prefs2: any): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    // Language exchange interest
    if (prefs1.languageExchangeInterest && prefs2.languageExchangeInterest) {
      score += 0.3;
      reasons.push('Mutual interest in language exchange');
    }

    // Cultural exchange preferences overlap
    const exchangeOverlap = this.calculateArrayOverlap(
      prefs1.culturalExchangePreferences,
      prefs2.culturalExchangePreferences
    );
    score += exchangeOverlap.score * 0.4;
    if (exchangeOverlap.score > 0) {
      reasons.push('Compatible cultural exchange interests');
    }

    // Learning interests overlap
    const learningOverlap = this.calculateArrayOverlap(
      prefs1.learningInterests,
      prefs2.learningInterests
    );
    score += learningOverlap.score * 0.3;
    if (learningOverlap.score > 0) {
      reasons.push('Shared learning interests');
    }

    return { score, reasons };
  }

  private static calculateArrayOverlap(arr1: string[], arr2: string[]): { score: number } {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
      return { score: 0 };
    }

    const overlap = arr1.filter(item => arr2.includes(item)).length;
    const maxPossible = Math.min(arr1.length, arr2.length);
    return { score: overlap / maxPossible };
  }

  private static areRestrictionsCompatible(
    restrictions1: string[],
    restrictions2: string[]
  ): boolean {
    if (!restrictions1 || !restrictions2) return true;
    // Check if any restriction from one person conflicts with the other's preferences
    return !restrictions1.some(r => restrictions2.includes(r));
  }

  public static async findMatches(profile: Profile, limit: number = 20): Promise<Array<{ profile: Profile; score: number; insights: string[] }>> {
    const profileRepository = AppDataSource.getRepository(Profile);

    // Get potential matches within the search radius
    const matches = await profileRepository
      .createQueryBuilder('profile')
      .where('profile.id != :profileId', { profileId: profile.id })
      .andWhere('profile.isActive = true')
      .andWhere('profile.gender = ANY(:interestedIn)', { interestedIn: profile.interestedIn })
      .getMany();

    // Calculate scores for each potential match
    const scoredMatches = matches.map(matchProfile => {
      // Calculate distance score
      const distance = this.calculateDistance(
        profile.latitude!,
        profile.longitude!,
        matchProfile.latitude!,
        matchProfile.longitude!
      );
      const distanceScore = Math.max(0, 1 - distance / profile.searchRadius);

      // Calculate cultural compatibility score
      const culturalScore = this.calculateCulturalScore(profile, matchProfile);

      // Calculate final weighted score
      const finalScore =
        distanceScore * this.DISTANCE_WEIGHT +
        culturalScore.score * this.CULTURAL_WEIGHT;

      const insights = this.getMatchingInsights(profile, matchProfile);

      return {
        profile: matchProfile,
        score: finalScore,
        insights: insights
      };
    });

    // Sort by score and return top matches
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  public static getMatchingInsights(profile1: Profile, profile2: Profile): string[] {
    const insights: string[] = [];
    
    // Cultural exchange opportunities
    if (profile1.culturalBackground !== profile2.culturalBackground) {
      insights.push(`Opportunity to learn about ${profile2.culturalBackground} culture`);
    }

    // Language learning potential
    const uniqueLanguages = profile2.languages?.filter(lang => 
      !profile1.languages?.includes(lang)
    );
    if (uniqueLanguages && uniqueLanguages.length > 0) {
      insights.push(`Chance to learn ${uniqueLanguages.join(', ')}`);
    }

    // Shared traditions
    if (profile1.culturalTraditions && profile2.culturalTraditions) {
      insights.push('Explore and share cultural traditions together');
    }

    // Food exploration
    const uniqueCuisine = profile2.cuisinePreferences?.filter(cuisine => 
      !profile1.cuisinePreferences?.includes(cuisine)
    );
    if (uniqueCuisine && uniqueCuisine.length > 0) {
      insights.push(`Discover ${uniqueCuisine.join(', ')} cuisine together`);
    }

    return insights;
  }

  public static suggestActivities(profile1: Profile, profile2: Profile): string[] {
    const suggestions: string[] = [];
    
    // Add dining suggestions based on food preferences
    if (this.hasCommonFoodInterests(profile1, profile2)) {
      suggestions.push(...this.ACTIVITIES.dining.slice(0, 2));
    }

    // Add cultural activities based on interests
    if (this.hasCommonCulturalInterests(profile1, profile2)) {
      suggestions.push(...this.ACTIVITIES.cultural.slice(0, 2));
    }

    // Add outdoor activities if both enjoy them
    if (this.hasCommonOutdoorInterests(profile1, profile2)) {
      suggestions.push(...this.ACTIVITIES.outdoor.slice(0, 2));
    }

    // Add learning activities if there's potential for exchange
    if (this.hasLearningPotential(profile1, profile2)) {
      suggestions.push(...this.ACTIVITIES.learning.slice(0, 2));
    }

    return this.shuffleArray(suggestions).slice(0, 5);
  }

  private static generateInsights(profile1: Profile, profile2: Profile): string[] {
    const insights: string[] = [];
    
    // Language exchange potential
    if (this.hasLanguageExchangePotential(profile1, profile2)) {
      insights.push('Opportunity for language exchange');
    }

    // Cultural exploration
    if (this.hasDifferentBackgrounds(profile1, profile2)) {
      insights.push('Chance to explore different perspectives');
    }

    // Shared interests
    const commonInterests = this.getCommonInterests(profile1, profile2);
    if (commonInterests.length > 0) {
      insights.push(`Shared interests in ${commonInterests.join(', ')}`);
    }

    return insights;
  }

  // Helper methods for checking specific compatibilities
  private static hasCommonFoodInterests(p1: Profile, p2: Profile): boolean {
    return this.calculateArrayOverlap(
      p1.preferences.cuisineInterests,
      p2.preferences.cuisineInterests
    ).score > 0.3;
  }

  private static hasCommonCulturalInterests(p1: Profile, p2: Profile): boolean {
    return this.calculateArrayOverlap(
      p1.preferences.artsCulture,
      p2.preferences.artsCulture
    ).score > 0.3;
  }

  private static hasCommonOutdoorInterests(p1: Profile, p2: Profile): boolean {
    return this.calculateArrayOverlap(
      p1.preferences.outdoorActivities,
      p2.preferences.outdoorActivities
    ).score > 0.3;
  }

  private static hasLearningPotential(p1: Profile, p2: Profile): boolean {
    return p1.background.languages.interested.some(lang => 
      p2.background.languages.fluent.includes(lang)
    ) || p2.background.languages.interested.some(lang => 
      p1.background.languages.fluent.includes(lang)
    );
  }

  private static hasLanguageExchangePotential(p1: Profile, p2: Profile): boolean {
    return p1.languageExchangeInterest && p2.languageExchangeInterest;
  }

  private static hasDifferentBackgrounds(p1: Profile, p2: Profile): boolean {
    return p1.culturalBackground !== p2.culturalBackground;
  }

  private static getCommonInterests(p1: Profile, p2: Profile): string[] {
    const commonInterests = p1.preferences.interests.filter(interest => 
      p2.preferences.interests.includes(interest)
    );
    return commonInterests;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 