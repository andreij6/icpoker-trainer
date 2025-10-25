
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAICoachSuggestion, formatCard } from './geminiService';
import { GameState, Card } from '../types';

const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function() {
    return {
      models: {
        generateContent: mockGenerateContent,
      },
    }
  }),
}));


describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAICoachSuggestion', () => {
    it('should return a suggestion when the user player is found', async () => {
      const gameState: GameState = {
        players: [
          { name: 'Player 1', stack: 1000, isYou: true, status: 'ACTIVE', cards: [{ suit: 'hearts', rank: 'A' }, { suit: 'hearts', rank: 'K' }] },
          { name: 'Player 2', stack: 1000, isYou: false, status: 'ACTIVE' },
        ],
        pot: 100,
        communityCards: [],
      };
      const userQuery = 'What should I do?';

      mockGenerateContent.mockResolvedValue({ text: 'Raise' });
      const suggestion = await getAICoachSuggestion(gameState, userQuery);

      expect(suggestion).toBe('Raise');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should return an error message when the user player is not found', async () => {
      const gameState: GameState = {
        players: [
          { name: 'Player 1', stack: 1000, isYou: false, status: 'ACTIVE' },
        ],
        pot: 100,
        communityCards: [],
      };
      const userQuery = 'What should I do?';
      const suggestion = await getAICoachSuggestion(gameState, userQuery);
      expect(suggestion).toBe('Error: User player not found.');
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('should return a custom error message when the Gemini API call fails', async () => {
      const gameState: GameState = {
        players: [
          { name: 'Player 1', stack: 1000, isYou: true, status: 'ACTIVE', cards: [{ suit: 'hearts', rank: 'A' }, { suit: 'hearts', rank: 'K' }] },
        ],
        pot: 100,
        communityCards: [],
      };
      const userQuery = 'What should I do?';

      mockGenerateContent.mockRejectedValue(new Error('API Error'));
      const suggestion = await getAICoachSuggestion(gameState, userQuery);

      expect(suggestion).toBe("Sorry, I couldn't process that request. Please check your API key and try again.");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatCard', () => {
    it('should format a card correctly', () => {
      const card: Card = { suit: 'hearts', rank: 'A' };
      expect(formatCard(card)).toBe('A of hearts');
    });

    it('should handle different suits and ranks', () => {
      const card: Card = { suit: 'spades', rank: '10' };
      expect(formatCard(card)).toBe('10 of spades');
    });
  });
});
