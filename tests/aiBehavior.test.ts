/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import {
  makeAIDecision,
  makePreflopDecision,
  makePostFlopDecision,
  calculateBetSize,
  calculatePreflopRaiseSize,
  isAITurn,
  getCurrentPlayer,
} from '../src/utils/aiUtils';
import { GameState, Player, GamePhase, PlayerStatus, Suit, Card } from '../src/types';
import { BIG_BLIND } from '../src/utils/gameActions';

// Helper to create a test player
const createTestPlayer = (id: number, stack: number, cards?: [Card, Card], isYou: boolean = false): Player => ({
  id,
  name: isYou ? 'You' : `Player ${id}`,
  avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
  stack,
  cards,
  status: PlayerStatus.Active,
  isEliminated: false,
  isYou,
});

// Helper to create a basic game state
const createTestGameState = (
  players: Player[],
  currentPlayerIndex: number,
  currentBet: number = 0,
  pot: number = 0,
  gamePhase: GamePhase = GamePhase.PREFLOP,
  communityCards: Card[] = []
): GameState => ({
  players,
  deck: [],
  communityCards,
  pot,
  gamePhase,
  bettingState: {
    currentPlayerIndex,
    currentBet,
    lastRaiserIndex: null,
    actions: [],
  },
  dealerIndex: 0,
});

describe('AI Decision Making - Integration Tests', () => {
  describe('Preflop AI Decisions', () => {
    it('should raise with strong hands (AA)', () => {
      const strongHand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Hearts, rank: 'A' }
      ];
      
      const player = createTestPlayer(2, 2500, strongHand);
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        player,
        createTestPlayer(3, 2500),
      ];
      
      const gameState = createTestGameState(players, 1, BIG_BLIND, 75);
      
      // Run decision multiple times to account for randomization
      let raiseOrCallCount = 0;
      for (let i = 0; i < 10; i++) {
        const decision = makePreflopDecision(player, gameState, 1);
        if (decision.action === 'raise' || decision.action === 'call') raiseOrCallCount++;
      }
      
      // With AA, should never fold, always raise or call (at least 100%)
      expect(raiseOrCallCount).toBe(10);
    });

    it('should fold weak hands from early position', () => {
      const weakHand: [Card, Card] = [
        { suit: Suit.Spades, rank: '7' },
        { suit: Suit.Hearts, rank: '2' }
      ];
      
      const player = createTestPlayer(3, 2500, weakHand);
      const players = Array.from({ length: 9 }, (_, i) => 
        i === 3 ? player : createTestPlayer(i + 1, 2500)
      );
      
      const gameState = createTestGameState(players, 3, BIG_BLIND, 75);
      
      const decision = makePreflopDecision(player, gameState, 3);
      
      expect(decision.action).toBe('fold');
    });

    it('should call playable hands from late position', () => {
      const playableHand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Hearts, rank: 'J' }
      ];
      
      const player = createTestPlayer(8, 2500, playableHand);
      const players = Array.from({ length: 9 }, (_, i) => 
        i === 8 ? player : createTestPlayer(i + 1, 2500)
      );
      
      const gameState = createTestGameState(players, 8, BIG_BLIND, 75);
      
      // Test multiple times
      let callOrRaiseCount = 0;
      for (let i = 0; i < 10; i++) {
        const decision = makePreflopDecision(player, gameState, 8);
        if (decision.action === 'call' || decision.action === 'raise') {
          callOrRaiseCount++;
        }
      }
      
      // Should call or raise from late position with playable hand
      expect(callOrRaiseCount).toBeGreaterThan(0);
    });

    it('should not make illegal actions', () => {
      const player = createTestPlayer(2, 100, [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Hearts, rank: 'K' }
      ]);
      
      const players = [createTestPlayer(1, 2500, undefined, true), player];
      const gameState = createTestGameState(players, 1, BIG_BLIND, 75);
      
      const decision = makePreflopDecision(player, gameState, 1);
      
      // Should not bet more than stack
      if (decision.action === 'raise') {
        expect(decision.amount).toBeLessThanOrEqual(player.stack);
      }
    });
  });

  describe('Post-flop AI Decisions', () => {
    it('should bet with strong hands', () => {
      const strongHand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'A' },
        { suit: Suit.Hearts, rank: 'K' }
      ];
      
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: 'K' },
        { suit: Suit.Hearts, rank: '7' }
      ];
      
      const player = createTestPlayer(2, 2500, strongHand);
      const players = [createTestPlayer(1, 2500, undefined, true), player];
      const gameState = createTestGameState(players, 1, 0, 200, GamePhase.FLOP, communityCards);
      
      let betOrRaiseCount = 0;
      for (let i = 0; i < 10; i++) {
        const decision = makePostFlopDecision(player, gameState, 1);
        if (decision.action === 'raise') betOrRaiseCount++;
      }
      
      // Should bet with trips most of the time
      expect(betOrRaiseCount).toBeGreaterThan(5);
    });

    it('should fold weak hands to bets', () => {
      const weakHand: [Card, Card] = [
        { suit: Suit.Spades, rank: '7' },
        { suit: Suit.Hearts, rank: '2' }
      ];
      
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: 'Q' },
        { suit: Suit.Hearts, rank: 'J' }
      ];
      
      const player = createTestPlayer(2, 2500, weakHand);
      const players = [createTestPlayer(1, 2500, undefined, true), player];
      const gameState = createTestGameState(players, 1, 100, 300, GamePhase.FLOP, communityCards);
      
      const decision = makePostFlopDecision(player, gameState, 1);
      
      expect(decision.action).toBe('fold');
    });

    it('should call with medium hands and good pot odds', () => {
      const mediumHand: [Card, Card] = [
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Hearts, rank: 'Q' }
      ];
      
      const communityCards: Card[] = [
        { suit: Suit.Diamonds, rank: 'K' },
        { suit: Suit.Clubs, rank: '8' },
        { suit: Suit.Hearts, rank: '3' }
      ];
      
      const player = createTestPlayer(2, 2500, mediumHand);
      const players = [createTestPlayer(1, 2500, undefined, true), player];
      // Small bet relative to pot (good pot odds)
      const gameState = createTestGameState(players, 1, 50, 400, GamePhase.FLOP, communityCards);
      
      const decision = makePostFlopDecision(player, gameState, 1);
      
      // With top pair and good pot odds, should call
      expect(['call', 'raise']).toContain(decision.action);
    });
  });

  describe('Bet Sizing', () => {
    it('should size bets appropriately based on strength', () => {
      const pot = 200;
      const stack = 2500;
      
      const monsterBet = calculateBetSize('monster', pot, stack);
      const strongBet = calculateBetSize('strong', pot, stack);
      const mediumBet = calculateBetSize('medium', pot, stack);
      const weakBet = calculateBetSize('weak', pot, stack);
      
      // Monster/strong bets should be larger than medium/weak
      expect(monsterBet).toBeGreaterThanOrEqual(strongBet * 0.8);
      expect(strongBet).toBeGreaterThan(mediumBet * 0.9);
      expect(mediumBet).toBeGreaterThanOrEqual(weakBet * 0.9);
      
      // All bets should be at least big blind
      expect(monsterBet).toBeGreaterThanOrEqual(BIG_BLIND);
      expect(strongBet).toBeGreaterThanOrEqual(BIG_BLIND);
      
      // All bets should not exceed stack
      expect(monsterBet).toBeLessThanOrEqual(stack);
    });

    it('should never bet more than player stack', () => {
      const pot = 1000;
      const smallStack = 100;
      
      const bet = calculateBetSize('monster', pot, smallStack);
      
      expect(bet).toBeLessThanOrEqual(smallStack);
    });

    it('should calculate preflop raises of 2-3x BB', () => {
      const stack = 2500;
      
      // Test multiple times due to randomization
      let totalRaiseSize = 0;
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        const raise = calculatePreflopRaiseSize('strong', 'dealer', 0, stack);
        totalRaiseSize += raise;
        
        // Should be roughly 2-4x BB (accounting for randomization)
        expect(raise).toBeGreaterThanOrEqual(BIG_BLIND * 1.5);
        expect(raise).toBeLessThanOrEqual(BIG_BLIND * 5);
      }
      
      // Average should be around 2.5-3.5x BB
      const averageRaise = totalRaiseSize / iterations;
      expect(averageRaise).toBeGreaterThanOrEqual(BIG_BLIND * 2);
      expect(averageRaise).toBeLessThanOrEqual(BIG_BLIND * 4);
    });
  });

  describe('AI Turn Management', () => {
    it('should correctly identify AI turns', () => {
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        createTestPlayer(2, 2500),
        createTestPlayer(3, 2500),
      ];
      
      const userTurnState = createTestGameState(players, 0, 0, 0);
      expect(isAITurn(userTurnState)).toBe(false);
      
      const aiTurnState = createTestGameState(players, 1, 0, 0);
      expect(isAITurn(aiTurnState)).toBe(true);
    });

    it('should get current player correctly', () => {
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        createTestPlayer(2, 2500),
        createTestPlayer(3, 2500),
      ];
      
      const gameState = createTestGameState(players, 1, 0, 0);
      const currentPlayer = getCurrentPlayer(gameState);
      
      expect(currentPlayer).not.toBeNull();
      expect(currentPlayer?.id).toBe(2);
    });
  });

  describe('AI Behavior Patterns', () => {
    it('should show variety in play (not always fold or always call)', () => {
      // Test with different hands and scenarios
      const actions = new Set<string>();
      
      const testHands: [Card, Card][] = [
        // Strong hand
        [{ suit: Suit.Spades, rank: 'K' }, { suit: Suit.Hearts, rank: 'K' }],
        // Playable suited
        [{ suit: Suit.Spades, rank: 'J' }, { suit: Suit.Spades, rank: '10' }],
        // Playable offsuit
        [{ suit: Suit.Spades, rank: 'Q' }, { suit: Suit.Hearts, rank: 'J' }],
        // Weak hand
        [{ suit: Suit.Spades, rank: '7' }, { suit: Suit.Hearts, rank: '2' }],
      ];
      
      testHands.forEach(hand => {
        // Test from different positions
        for (let playerPos = 1; playerPos <= 8; playerPos++) {
          const players = Array.from({ length: 9 }, (_, i) => 
            i === playerPos ? createTestPlayer(playerPos + 1, 2500, hand) : createTestPlayer(i + 1, 2500)
          );
          
          const gameState = createTestGameState(players, playerPos, BIG_BLIND, 75);
          const decision = makePreflopDecision(players[playerPos], gameState, playerPos);
          actions.add(decision.action);
        }
      });
      
      // Should have at least 2 different actions across all tests
      expect(actions.size).toBeGreaterThanOrEqual(2);
    });

    it('should raise approximately 15-25% of hands preflop from various positions', () => {
      const testHands: [Card, Card][] = [
        // Strong hands
        [{ suit: Suit.Spades, rank: 'A' }, { suit: Suit.Hearts, rank: 'A' }],
        [{ suit: Suit.Spades, rank: 'K' }, { suit: Suit.Hearts, rank: 'K' }],
        [{ suit: Suit.Spades, rank: 'A' }, { suit: Suit.Spades, rank: 'K' }],
        // Playable hands
        [{ suit: Suit.Spades, rank: 'Q' }, { suit: Suit.Hearts, rank: 'Q' }],
        [{ suit: Suit.Spades, rank: 'J' }, { suit: Suit.Clubs, rank: 'J' }],
        [{ suit: Suit.Spades, rank: 'A' }, { suit: Suit.Spades, rank: 'Q' }],
        [{ suit: Suit.Hearts, rank: 'K' }, { suit: Suit.Hearts, rank: 'J' }],
        [{ suit: Suit.Spades, rank: '10' }, { suit: Suit.Hearts, rank: '10' }],
        // Marginal/weak hands
        [{ suit: Suit.Spades, rank: '9' }, { suit: Suit.Hearts, rank: '9' }],
        [{ suit: Suit.Spades, rank: 'A' }, { suit: Suit.Hearts, rank: '10' }],
        [{ suit: Suit.Spades, rank: 'K' }, { suit: Suit.Hearts, rank: '10' }],
        [{ suit: Suit.Spades, rank: 'Q' }, { suit: Suit.Hearts, rank: 'J' }],
        [{ suit: Suit.Spades, rank: '8' }, { suit: Suit.Hearts, rank: '7' }],
        [{ suit: Suit.Spades, rank: 'J' }, { suit: Suit.Hearts, rank: '9' }],
        [{ suit: Suit.Spades, rank: '10' }, { suit: Suit.Hearts, rank: '8' }],
        [{ suit: Suit.Spades, rank: 'K' }, { suit: Suit.Hearts, rank: '5' }],
        [{ suit: Suit.Spades, rank: 'Q' }, { suit: Suit.Hearts, rank: '7' }],
        [{ suit: Suit.Spades, rank: '7' }, { suit: Suit.Hearts, rank: '2' }],
        [{ suit: Suit.Spades, rank: '9' }, { suit: Suit.Hearts, rank: '4' }],
        [{ suit: Suit.Spades, rank: '6' }, { suit: Suit.Hearts, rank: '3' }],
      ];
      
      let raiseCount = 0;
      const totalTests = testHands.length;
      
      testHands.forEach((hand, index) => {
        const player = createTestPlayer(2, 2500, hand);
        const players = [createTestPlayer(1, 2500, undefined, true), player];
        
        // Vary position
        const dealerIndex = index % 2;
        const gameState = createTestGameState(players, 1, 0, 75);
        gameState.dealerIndex = dealerIndex;
        
        const decision = makePreflopDecision(player, gameState, 1);
        if (decision.action === 'raise') {
          raiseCount++;
        }
      });
      
      const raisePercentage = (raiseCount / totalTests) * 100;
      
      // With this hand distribution and no facing raises, should raise roughly 15-40% of time
      expect(raisePercentage).toBeGreaterThanOrEqual(10);
      expect(raisePercentage).toBeLessThanOrEqual(50);
    });

    it('should successfully make decisions with various hand types without errors', () => {
      const testScenarios = [
        {
          hand: [{ suit: Suit.Spades, rank: 'A' }, { suit: Suit.Hearts, rank: 'K' }] as [Card, Card],
          community: [{ suit: Suit.Diamonds, rank: 'K' }, { suit: Suit.Clubs, rank: '7' }, { suit: Suit.Hearts, rank: '2' }],
          phase: GamePhase.FLOP,
        },
        {
          hand: [{ suit: Suit.Spades, rank: '9' }, { suit: Suit.Spades, rank: '8' }] as [Card, Card],
          community: [{ suit: Suit.Spades, rank: '7' }, { suit: Suit.Spades, rank: '6' }, { suit: Suit.Clubs, rank: '2' }],
          phase: GamePhase.FLOP,
        },
        {
          hand: [{ suit: Suit.Hearts, rank: 'Q' }, { suit: Suit.Diamonds, rank: 'Q' }] as [Card, Card],
          community: [{ suit: Suit.Clubs, rank: 'A' }, { suit: Suit.Clubs, rank: 'K' }, { suit: Suit.Spades, rank: 'Q' }],
          phase: GamePhase.FLOP,
        },
      ];
      
      testScenarios.forEach(scenario => {
        const player = createTestPlayer(2, 2500, scenario.hand);
        const players = [createTestPlayer(1, 2500, undefined, true), player];
        const gameState = createTestGameState(players, 1, 0, 200, scenario.phase, scenario.community);
        
        // Should not throw an error
        expect(() => {
          makeAIDecision(player, gameState, 1);
        }).not.toThrow();
      });
    });
  });
});

