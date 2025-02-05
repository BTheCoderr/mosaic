import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Profile } from '../models/Profile';
import { Match, MatchStatus } from '../models/Match';
import { MatchingService } from '../services/matchingService';
import { redis } from '../config/redis';

const profileRepository = AppDataSource.getRepository(Profile);
const matchRepository = AppDataSource.getRepository(Match);

export const getPotentialMatches = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // Set by auth middleware
    const profile = await profileRepository.findOne({
      where: { user: { id: userId } }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get matches from cache or calculate new ones
    const cacheKey = `matches:${userId}`;
    let matches = await redis.get(cacheKey);

    if (!matches) {
      const calculatedMatches = await MatchingService.findMatches(profile);
      matches = JSON.stringify(calculatedMatches);
      // Cache for 1 hour
      await redis.set(cacheKey, matches, 'EX', 3600);
    } else {
      matches = JSON.parse(matches);
    }

    res.json(matches);
  } catch (error) {
    console.error('Error getting potential matches:', error);
    res.status(500).json({ error: 'Failed to get potential matches' });
  }
};

export const likeProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.params;

    // Check if match already exists
    let match = await matchRepository.findOne({
      where: [
        { user1: { id: userId }, user2: { id: targetUserId } },
        { user1: { id: targetUserId }, user2: { id: userId } }
      ],
      relations: ['user1', 'user2']
    });

    if (match) {
      // If current user is user2 and hasn't liked yet
      if (match.user2.id === userId && !match.user2Liked) {
        match.user2Liked = true;
        if (match.user1Liked) {
          match.status = MatchStatus.MATCHED;
        }
      }
      // If current user is user1 and hasn't liked yet
      else if (match.user1.id === userId && !match.user1Liked) {
        match.user1Liked = true;
        if (match.user2Liked) {
          match.status = MatchStatus.MATCHED;
        }
      }
    } else {
      // Create new match
      match = new Match();
      match.user1 = { id: userId } as any;
      match.user2 = { id: targetUserId } as any;
      match.user1Liked = true;
      match.status = MatchStatus.PENDING;
    }

    const savedMatch = await matchRepository.save(match);

    // If it's a mutual match, send insights
    if (savedMatch.status === MatchStatus.MATCHED) {
      const [profile1, profile2] = await Promise.all([
        profileRepository.findOne({ where: { user: { id: userId } } }),
        profileRepository.findOne({ where: { user: { id: targetUserId } } })
      ]);

      if (profile1 && profile2) {
        const insights = MatchingService.getMatchingInsights(profile1, profile2);
        const eventSuggestions = MatchingService.suggestEvents(profile1, profile2);
        return res.json({
          match: savedMatch,
          insights,
          eventSuggestions,
          message: 'It\'s a match! 🎉'
        });
      }
    }

    res.json({ match: savedMatch });
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({ error: 'Failed to like profile' });
  }
};

export const passProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.params;

    // Check if match exists
    const match = await matchRepository.findOne({
      where: [
        { user1: { id: userId }, user2: { id: targetUserId } },
        { user1: { id: targetUserId }, user2: { id: userId } }
      ]
    });

    if (match) {
      match.status = MatchStatus.REJECTED;
      await matchRepository.save(match);
    } else {
      // Create new match with rejected status
      const newMatch = new Match();
      newMatch.user1 = { id: userId } as any;
      newMatch.user2 = { id: targetUserId } as any;
      newMatch.status = MatchStatus.REJECTED;
      await matchRepository.save(newMatch);
    }

    res.json({ message: 'Profile passed' });
  } catch (error) {
    console.error('Error passing profile:', error);
    res.status(500).json({ error: 'Failed to pass profile' });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const matches = await matchRepository.find({
      where: [
        { user1: { id: userId }, status: MatchStatus.MATCHED },
        { user2: { id: userId }, status: MatchStatus.MATCHED }
      ],
      relations: ['user1', 'user1.profile', 'user2', 'user2.profile'],
      order: { lastMessageAt: 'DESC' }
    });

    // Get insights and event suggestions for each match
    const matchesWithDetails = matches.map(match => {
      const isUser1 = match.user1.id === userId;
      const userProfile = isUser1 ? match.user1.profile : match.user2.profile;
      const matchProfile = isUser1 ? match.user2.profile : match.user1.profile;
      
      return {
        ...match,
        insights: MatchingService.getMatchingInsights(userProfile, matchProfile),
        eventSuggestions: MatchingService.suggestEvents(userProfile, matchProfile)
      };
    });

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

export const unmatch = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { matchId } = req.params;

    const match = await matchRepository.findOne({
      where: { id: matchId },
      relations: ['user1', 'user2']
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify user is part of the match
    if (match.user1.id !== userId && match.user2.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    match.status = MatchStatus.EXPIRED;
    match.unmatchedAt = new Date();
    await matchRepository.save(match);

    res.json({ message: 'Successfully unmatched' });
  } catch (error) {
    console.error('Error unmatching:', error);
    res.status(500).json({ error: 'Failed to unmatch' });
  }
}; 