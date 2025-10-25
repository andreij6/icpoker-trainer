/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { formatGameContext } from '../src/services/geminiService';
import { isUserTurn, shouldTriggerAutoCoaching, getCurrentPlayer } from '../src/utils/coachingUtils';
import { GameState, GamePhase, PlayerStatus, Suit } from '../src/types';

// Helper to create a test game state
const createTestGameState = (overrides: Partial<GameState> = {}): GameState => ({
  players: [
    {
      id: 1,
      name: 'You',
      avatarUrl: '',
      stack: 2500,
      cards: [
        { suit: Suit.Hearts, rank: 'A' },
        { suit: Suit.Hearts, rank: 'K' }
      ],
      status: PlayerStatus.Active,
      isYou: true,
      isEliminated: false
    },
    {
      id: 2,
      name: 'Player 2',
      avatarUrl: '',
      stack: 2500,
      status: PlayerStatus.Active,
      isEliminated: false
    }
  ],
  deck: [],
  communityCards: [],
  pot: 75,
  gamePhase: GamePhase.PREFLOP,
  bettingState: {
    currentPlayerIndex: 0,
    currentBet: 50,
    lastRaiserIndex: null,
    actions: []
  },
  dealerIndex: 1,
  ...overrides
});

describe('Task 3.8: Test Coaching Quality', () => {
  describe('Game Context Formatting', () => {
    it('should format user hole cards correctly', () => {
      const gameState = createTestGameState();
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Ace of Hearts');
      expect(context).toContain('King of Hearts');
    });

    it('should include game phase in context', () => {
      const gameState = createTestGameState();
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Preflop');
    });

    it('should include pot size in context', () => {
      const gameState = createTestGameState({ pot: 150 });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('150');
    });

    it('should calculate pot odds correctly', () => {
      const gameState = createTestGameState({
        pot: 200,
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 100,
          lastRaiserIndex: null,
          actions: []
        }
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Pot Odds');
      expect(context).toContain(':1');
    });

    it('should show community cards when dealt', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.FLOP,
        communityCards: [
          { suit: Suit.Spades, rank: 'Q' },
          { suit: Suit.Spades, rank: 'J' },
          { suit: Suit.Spades, rank: '10' }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Queen of Spades');
      expect(context).toContain('Jack of Spades');
      expect(context).toContain('Ten of Spades');
    });

    it('should indicate no community cards preflop', () => {
      const gameState = createTestGameState();
      const context = formatGameContext(gameState);
      
      expect(context).toContain('None dealt yet');
    });

    it('should list active opponents', () => {
      const gameState = createTestGameState({
        players: [
          {
            id: 1,
            name: 'You',
            avatarUrl: '',
            stack: 2500,
            status: PlayerStatus.Active,
            isYou: true,
            isEliminated: false
          },
          {
            id: 2,
            name: 'Alice',
            avatarUrl: '',
            stack: 3000,
            status: PlayerStatus.Active,
            isEliminated: false
          },
          {
            id: 3,
            name: 'Bob',
            avatarUrl: '',
            stack: 1500,
            status: PlayerStatus.Active,
            isEliminated: false
          }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Alice');
      expect(context).toContain('Bob');
      expect(context).toContain('3000');
      expect(context).toContain('1500');
    });

    it('should show recent actions', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 100,
          lastRaiserIndex: 1,
          actions: [
            { playerId: 2, action: 'raise', amount: 100 }
          ]
        }
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('RECENT ACTIONS');
      expect(context).toContain('Player 2');
    });

    it('should handle preflop with no actions', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      const context = formatGameContext(gameState);
      
      expect(context).toBeDefined();
      expect(context.length).toBeGreaterThan(0);
    });
  });

  describe('Coaching Trigger Logic', () => {
    it('should identify when it is the user turn', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(isUserTurn(gameState)).toBe(true);
    });

    it('should identify when it is not the user turn', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 1,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(isUserTurn(gameState)).toBe(false);
    });

    it('should trigger auto coaching on user turn in active phase', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.PREFLOP,
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(shouldTriggerAutoCoaching(gameState, false)).toBe(true);
    });

    it('should not trigger if already received coaching', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.PREFLOP,
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(shouldTriggerAutoCoaching(gameState, true)).toBe(false);
    });

    it('should not trigger coaching during PRE_DEAL phase', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.PRE_DEAL,
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 0,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(shouldTriggerAutoCoaching(gameState, false)).toBe(false);
    });

    it('should not trigger coaching during SHOWDOWN phase', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.SHOWDOWN,
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 0,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(shouldTriggerAutoCoaching(gameState, false)).toBe(false);
    });

    it('should not trigger when not user turn', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.FLOP,
        bettingState: {
          currentPlayerIndex: 1,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      expect(shouldTriggerAutoCoaching(gameState, false)).toBe(false);
    });
  });

  describe('Current Player Detection', () => {
    it('should get the current player correctly', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      const currentPlayer = getCurrentPlayer(gameState);
      expect(currentPlayer).toBeDefined();
      expect(currentPlayer?.isYou).toBe(true);
    });

    it('should get AI player when it is their turn', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 1,
          currentBet: 50,
          lastRaiserIndex: null,
          actions: []
        }
      });
      
      const currentPlayer = getCurrentPlayer(gameState);
      expect(currentPlayer).toBeDefined();
      expect(currentPlayer?.name).toBe('Player 2');
    });
  });

  describe('Context Quality for Different Phases', () => {
    it('should provide relevant context for preflop', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.PREFLOP,
        communityCards: []
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Preflop');
      expect(context).toContain('Your Hand');
      expect(context).not.toContain('Community Cards (Board):');
    });

    it('should provide relevant context for flop', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.FLOP,
        communityCards: [
          { suit: Suit.Hearts, rank: 'Q' },
          { suit: Suit.Diamonds, rank: 'J' },
          { suit: Suit.Clubs, rank: '10' }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Flop');
      expect(context).toContain('Queen of Hearts');
    });

    it('should provide relevant context for turn', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.TURN,
        communityCards: [
          { suit: Suit.Hearts, rank: 'Q' },
          { suit: Suit.Diamonds, rank: 'J' },
          { suit: Suit.Clubs, rank: '10' },
          { suit: Suit.Spades, rank: '9' }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Turn');
      expect(context).toContain('Nine of Spades');
    });

    it('should provide relevant context for river', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.RIVER,
        communityCards: [
          { suit: Suit.Hearts, rank: 'Q' },
          { suit: Suit.Diamonds, rank: 'J' },
          { suit: Suit.Clubs, rank: '10' },
          { suit: Suit.Spades, rank: '9' },
          { suit: Suit.Hearts, rank: '8' }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('River');
      expect(context).toContain('Eight of Hearts');
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with no cards', () => {
      const gameState = createTestGameState({
        players: [
          {
            id: 1,
            name: 'You',
            avatarUrl: '',
            stack: 2500,
            status: PlayerStatus.Active,
            isYou: true,
            isEliminated: false
          }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('cards not dealt');
    });

    it('should handle no active opponents', () => {
      const gameState = createTestGameState({
        players: [
          {
            id: 1,
            name: 'You',
            avatarUrl: '',
            stack: 2500,
            cards: [
              { suit: Suit.Hearts, rank: 'A' },
              { suit: Suit.Hearts, rank: 'K' }
            ],
            status: PlayerStatus.Active,
            isYou: true,
            isEliminated: false
          }
        ]
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Active Opponents: 0');
    });

    it('should handle when user can check (no cost to call)', () => {
      const gameState = createTestGameState({
        bettingState: {
          currentPlayerIndex: 0,
          currentBet: 0,
          lastRaiserIndex: null,
          actions: []
        }
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('you can check');
    });

    it('should format user position correctly', () => {
      const gameState = createTestGameState({
        players: Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          name: i === 0 ? 'You' : `Player ${i + 1}`,
          avatarUrl: '',
          stack: 2500,
          status: PlayerStatus.Active,
          isYou: i === 0,
          isEliminated: false
        })),
        dealerIndex: 8
      });
      const context = formatGameContext(gameState);
      
      expect(context).toContain('Position');
    });
  });
});

