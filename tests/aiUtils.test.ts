/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { 
  getHandTier, 
  evaluatePostFlopStrength,
  getPosition,
  isLatePosition,
  adjustTierForPosition
} from '../src/utils/aiUtils';
import { Card, Suit } from '../src/types';

describe('getHandTier - Preflop Hand Evaluation', () => {
  // Strong Hands
  describe('Strong Hands', () => {
    it('should classify AA as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Clubs, rank: 'A' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify KK as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Diamonds, rank: 'K' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify QQ as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'Q' },
        { suit: Suit.Clubs, rank: 'Q' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify JJ as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: 'J' },
        { suit: Suit.Spades, rank: 'J' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify 10-10 as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: '10' },
        { suit: Suit.Hearts, rank: '10' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify AKs as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Spades, rank: 'K' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify AKo as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Clubs, rank: 'K' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify AQs as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: 'A' },
        { suit: Suit.Diamonds, rank: 'Q' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify AJs as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'A' },
        { suit: Suit.Hearts, rank: 'J' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify KQs as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Clubs, rank: 'K' },
        { suit: Suit.Clubs, rank: 'Q' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });

    it('should classify KJs as strong', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Spades, rank: 'J' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('strong');
    });
  });

  // Playable Hands
  describe('Playable Hands', () => {
    it('should classify 99 as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: '9' },
        { suit: Suit.Clubs, rank: '9' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify 55 as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: '5' },
        { suit: Suit.Diamonds, rank: '5' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify 22 as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: '2' },
        { suit: Suit.Diamonds, rank: '2' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify A9s as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Spades, rank: '9' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify A2s as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'A' },
        { suit: Suit.Hearts, rank: '2' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify K10s as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'K' },
        { suit: Suit.Hearts, rank: '10' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify Q10s as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: 'Q' },
        { suit: Suit.Diamonds, rank: '10' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify J10s as playable', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Clubs, rank: 'J' },
        { suit: Suit.Clubs, rank: '10' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify 78s as playable (suited connector)', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: '7' },
        { suit: Suit.Diamonds, rank: '8' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify 54s as playable (suited connector)', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Clubs, rank: '5' },
        { suit: Suit.Clubs, rank: '4' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify 97s as playable (suited one-gapper)', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: '9' },
        { suit: Suit.Spades, rank: '7' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify QJo as playable (offsuit broadway)', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'Q' },
        { suit: Suit.Diamonds, rank: 'J' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify K10o as playable (offsuit broadway)', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'K' },
        { suit: Suit.Clubs, rank: '10' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });

    it('should classify Q10o as playable (offsuit broadway)', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: 'Q' },
        { suit: Suit.Spades, rank: '10' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('playable');
    });
  });

  // Weak Hands
  describe('Weak Hands', () => {
    it('should classify 72o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: '7' },
        { suit: Suit.Clubs, rank: '2' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify 94s as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: '9' },
        { suit: Suit.Spades, rank: '4' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify 10-2o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: '10' },
        { suit: Suit.Diamonds, rank: '2' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify K5o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Clubs, rank: '5' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify Q8o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'Q' },
        { suit: Suit.Diamonds, rank: '8' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify J7o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'J' },
        { suit: Suit.Clubs, rank: '7' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify J3o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Diamonds, rank: 'J' },
        { suit: Suit.Hearts, rank: '3' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });

    it('should classify 10-6o as weak', () => {
      const hand: [Card, Card] = [
        { suit: Suit.Clubs, rank: '10' },
        { suit: Suit.Spades, rank: '6' }
      ];
      expect(getHandTier(hand[0], hand[1])).toBe('weak');
    });
  });
});

describe('evaluatePostFlopStrength - Post-flop Hand Evaluation', () => {
  describe('Monster Hands', () => {
    it('should classify a straight flush as monster', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Hearts, rank: '9' },
        { suit: Suit.Hearts, rank: '8' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Hearts, rank: '7' },
        { suit: Suit.Hearts, rank: '6' },
        { suit: Suit.Hearts, rank: '5' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('monster');
    });

    it('should classify four of a kind as monster', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Hearts, rank: 'A' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'A' },
        { suit: Suit.Clubs, rank: 'A' },
        { suit: Suit.Hearts, rank: 'K' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('monster');
    });

    it('should classify a full house as monster', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Hearts, rank: 'K' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: '7' },
        { suit: Suit.Hearts, rank: '7' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('monster');
    });
  });

  describe('Strong Hands', () => {
    it('should classify a flush as strong', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Spades, rank: 'K' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Spades, rank: '9' },
        { suit: Suit.Spades, rank: '5' },
        { suit: Suit.Spades, rank: '2' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('strong');
    });

    it('should classify a straight as strong', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Hearts, rank: '9' },
        { suit: Suit.Clubs, rank: '8' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: '7' },
        { suit: Suit.Spades, rank: '6' },
        { suit: Suit.Hearts, rank: '5' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('strong');
    });

    it('should classify three of a kind as strong', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'J' },
        { suit: Suit.Hearts, rank: 'J' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'J' },
        { suit: Suit.Clubs, rank: '9' },
        { suit: Suit.Hearts, rank: '4' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('strong');
    });
  });

  describe('Medium Hands', () => {
    it('should classify two pair as medium', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Hearts, rank: 'Q' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: 'Q' },
        { suit: Suit.Hearts, rank: '7' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('medium');
    });

    it('should classify top pair with good kicker as medium', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Hearts, rank: 'K' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: '8' },
        { suit: Suit.Hearts, rank: '3' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('medium');
    });

    it('should classify flush draw as medium', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Hearts, rank: 'A' },
        { suit: Suit.Hearts, rank: 'K' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Hearts, rank: '9' },
        { suit: Suit.Hearts, rank: '5' },
        { suit: Suit.Clubs, rank: '2' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('medium');
    });
  });

  describe('Weak Hands', () => {
    it('should classify top pair weak kicker as weak', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Hearts, rank: '5' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: '9' },
        { suit: Suit.Hearts, rank: '7' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('weak');
    });

    it('should classify middle pair as weak', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: '9' },
        { suit: Suit.Hearts, rank: '8' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: '9' },
        { suit: Suit.Hearts, rank: '4' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('weak');
    });

    it('should classify overcards as weak', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Hearts, rank: 'K' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: '9' },
        { suit: Suit.Clubs, rank: '7' },
        { suit: Suit.Hearts, rank: '2' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('weak');
    });
  });

  describe('Trash Hands', () => {
    it('should classify complete air as trash', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: '7' },
        { suit: Suit.Hearts, rank: '2' }
      ];
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: 'Q' },
        { suit: Suit.Hearts, rank: '9' }
      ];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('trash');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no community cards by falling back to preflop evaluation', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Hearts, rank: 'A' }
      ];
      const communityCards: Card[] = [];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('strong');
    });

    it('should handle weak preflop hand with no community cards', () => {
      const holeCards: [Card, Card] = [
        { suit: Suit.Spades, rank: '7' },
        { suit: Suit.Hearts, rank: '2' }
      ];
      const communityCards: Card[] = [];
      expect(evaluatePostFlopStrength(holeCards, communityCards)).toBe('weak');
    });
  });
});

describe('getPosition - Position Awareness', () => {
  describe('9-player table', () => {
    const totalPlayers = 9;
    const dealerIndex = 0;

    it('should identify dealer position', () => {
      expect(getPosition(0, dealerIndex, totalPlayers)).toBe('dealer');
    });

    it('should identify small blind (1 seat after dealer)', () => {
      expect(getPosition(1, dealerIndex, totalPlayers)).toBe('small_blind');
    });

    it('should identify big blind (2 seats after dealer)', () => {
      expect(getPosition(2, dealerIndex, totalPlayers)).toBe('big_blind');
    });

    it('should identify early position (3-4 seats after dealer)', () => {
      expect(getPosition(3, dealerIndex, totalPlayers)).toBe('early');
      expect(getPosition(4, dealerIndex, totalPlayers)).toBe('early');
    });

    it('should identify middle position (5-6 seats after dealer)', () => {
      expect(getPosition(5, dealerIndex, totalPlayers)).toBe('middle');
      expect(getPosition(6, dealerIndex, totalPlayers)).toBe('middle');
    });

    it('should identify late position (7-8 seats after dealer)', () => {
      expect(getPosition(7, dealerIndex, totalPlayers)).toBe('late');
      expect(getPosition(8, dealerIndex, totalPlayers)).toBe('late');
    });
  });

  describe('6-player table', () => {
    const totalPlayers = 6;
    const dealerIndex = 2;

    it('should correctly calculate positions with different dealer index', () => {
      expect(getPosition(2, dealerIndex, totalPlayers)).toBe('dealer');
      expect(getPosition(3, dealerIndex, totalPlayers)).toBe('small_blind');
      expect(getPosition(4, dealerIndex, totalPlayers)).toBe('big_blind');
      expect(getPosition(5, dealerIndex, totalPlayers)).toBe('early');
      expect(getPosition(0, dealerIndex, totalPlayers)).toBe('early'); // Wraps around
      expect(getPosition(1, dealerIndex, totalPlayers)).toBe('late');
    });
  });

  describe('4-player table', () => {
    const totalPlayers = 4;
    const dealerIndex = 0;

    it('should use simplified positions for small tables', () => {
      expect(getPosition(0, dealerIndex, totalPlayers)).toBe('dealer');
      expect(getPosition(1, dealerIndex, totalPlayers)).toBe('small_blind');
      expect(getPosition(2, dealerIndex, totalPlayers)).toBe('big_blind');
      expect(getPosition(3, dealerIndex, totalPlayers)).toBe('late');
    });
  });

  describe('heads-up (2 players)', () => {
    const totalPlayers = 2;
    const dealerIndex = 0;

    it('should handle heads-up correctly', () => {
      expect(getPosition(0, dealerIndex, totalPlayers)).toBe('small_blind');
      expect(getPosition(1, dealerIndex, totalPlayers)).toBe('big_blind');
    });
  });
});

describe('isLatePosition', () => {
  it('should return true for late position', () => {
    expect(isLatePosition('late')).toBe(true);
    expect(isLatePosition('dealer')).toBe(true);
  });

  it('should return false for early/middle positions', () => {
    expect(isLatePosition('early')).toBe(false);
    expect(isLatePosition('middle')).toBe(false);
    expect(isLatePosition('small_blind')).toBe(false);
    expect(isLatePosition('big_blind')).toBe(false);
  });
});

describe('adjustTierForPosition', () => {
  it('should downgrade playable hands in early position', () => {
    expect(adjustTierForPosition('playable', 'early')).toBe('weak');
  });

  it('should keep strong hands strong in all positions', () => {
    expect(adjustTierForPosition('strong', 'early')).toBe('strong');
    expect(adjustTierForPosition('strong', 'middle')).toBe('strong');
    expect(adjustTierForPosition('strong', 'late')).toBe('strong');
  });

  it('should keep playable hands playable in middle/late positions', () => {
    expect(adjustTierForPosition('playable', 'middle')).toBe('playable');
    expect(adjustTierForPosition('playable', 'late')).toBe('playable');
    expect(adjustTierForPosition('playable', 'dealer')).toBe('playable');
  });

  it('should keep weak hands weak in all positions', () => {
    expect(adjustTierForPosition('weak', 'early')).toBe('weak');
    expect(adjustTierForPosition('weak', 'middle')).toBe('weak');
    expect(adjustTierForPosition('weak', 'late')).toBe('weak');
  });
});
