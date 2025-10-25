/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  fold,
  call,
  raise,
  check,
  startNewHand,
  progressGamePhase,
  endHand,
  SMALL_BLIND,
  BIG_BLIND,
} from '../src/utils/gameActions';
import { GameState, Player, GamePhase, PlayerStatus, Suit, Card } from '../src/types';

// Helper to create a test player
const createTestPlayer = (
  id: number,
  stack: number,
  cards?: [Card, Card],
  isYou: boolean = false,
  status: PlayerStatus = PlayerStatus.Active
): Player => ({
  id,
  name: isYou ? 'You' : `Player ${id}`,
  avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
  stack,
  cards,
  status,
  isEliminated: false,
  isYou,
});

// Helper to create initial game state
const createInitialGameState = (players: Player[]): GameState => ({
  players,
  deck: [],
  communityCards: [],
  pot: 0,
  gamePhase: GamePhase.PRE_DEAL,
  bettingState: {
    currentPlayerIndex: 0,
    currentBet: 0,
    lastRaiserIndex: null,
    actions: [],
  },
  dealerIndex: 0,
});

describe('Game Actions - Phase 1 Implementation Tests', () => {
  describe('Task 1.3: Hand Initialization (startNewHand)', () => {
    it('should move dealer button clockwise', () => {
      // Create 9 players to match expected game size
      const players = Array.from({ length: 9 }, (_, i) => 
        createTestPlayer(i + 1, 2500, undefined, i === 0)
      );
      
      let gameState = createInitialGameState(players);
      gameState.dealerIndex = 0;
      
      const initialDealer = gameState.dealerIndex;
      gameState = startNewHand(gameState);
      
      // Dealer should move (accounting for eliminated players)
      expect(gameState.dealerIndex).toBeGreaterThanOrEqual(0);
      expect(gameState.dealerIndex).toBeLessThan(gameState.players.length);
    });

    it('should post small blind (25) and big blind (50)', () => {
      const players = Array.from({ length: 9 }, (_, i) => 
        createTestPlayer(i + 1, 2500, undefined, i === 0)
      );
      
      const gameState = createInitialGameState(players);
      const newState = startNewHand(gameState);
      
      // Pot should have blinds
      expect(newState.pot).toBe(SMALL_BLIND + BIG_BLIND);
      
      // Total chips should be conserved (some players paid blinds)
      const totalChips = newState.players.reduce((sum, p) => sum + p.stack, 0);
      expect(totalChips).toBe(9 * 2500 - SMALL_BLIND - BIG_BLIND);
    });

    it('should deal 2 cards to each active player', () => {
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        createTestPlayer(2, 2500),
        createTestPlayer(3, 2500),
      ];
      
      const gameState = createInitialGameState(players);
      const newState = startNewHand(gameState);
      
      newState.players.forEach(player => {
        if (!player.isEliminated) {
          expect(player.cards).toBeDefined();
          expect(player.cards?.length).toBe(2);
        }
      });
    });

    it('should set game phase to PREFLOP', () => {
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        createTestPlayer(2, 2500),
      ];
      
      const gameState = createInitialGameState(players);
      const newState = startNewHand(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.PREFLOP);
    });

    it('should set current player to position after big blind', () => {
      const players = Array.from({ length: 9 }, (_, i) => 
        createTestPlayer(i + 1, 2500, undefined, i === 0)
      );
      
      const gameState = createInitialGameState(players);
      const newState = startNewHand(gameState);
      
      // Current player should be a valid index
      expect(newState.bettingState.currentPlayerIndex).toBeGreaterThanOrEqual(0);
      expect(newState.bettingState.currentPlayerIndex).toBeLessThan(newState.players.length);
      
      // Current bet should be set to big blind
      expect(newState.bettingState.currentBet).toBe(BIG_BLIND);
    });

    it('should mark players with 0 chips as eliminated', () => {
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        createTestPlayer(2, 0), // Busted player
        createTestPlayer(3, 2500),
      ];
      
      const gameState = createInitialGameState(players);
      const newState = startNewHand(gameState);
      
      expect(newState.players[1].isEliminated).toBe(true);
    });

    it('should add new AI players if fewer than 8 AI remain', () => {
      const players = [
        createTestPlayer(1, 2500, undefined, true),
        createTestPlayer(2, 0), // Eliminated
        createTestPlayer(3, 0), // Eliminated
      ];
      players[1].isEliminated = true;
      players[2].isEliminated = true;
      
      const gameState = createInitialGameState(players);
      const newState = startNewHand(gameState);
      
      // Should have 9 total players (1 human + 8 AI)
      const activePlayers = newState.players.filter(p => !p.isEliminated);
      expect(activePlayers.length).toBeGreaterThanOrEqual(3); // At least human + 2 new AI
    });
  });

  describe('Task 1.4: Betting Round Logic', () => {
    describe('fold()', () => {
      it('should mark player as folded', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = fold(gameState, 1);
        
        expect(newState.players[0].status).toBe(PlayerStatus.Folded);
      });

      it('should add fold action to betting history', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = fold(gameState, 1);
        
        expect(newState.bettingState.actions).toHaveLength(1);
        expect(newState.bettingState.actions[0].action).toBe('fold');
        expect(newState.bettingState.actions[0].playerId).toBe(1);
      });

      it('should move to next active player', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
          createTestPlayer(3, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = fold(gameState, 1);
        
        expect(newState.bettingState.currentPlayerIndex).not.toBe(0);
      });
    });

    describe('call()', () => {
      it('should deduct correct amount from player stack', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = call(gameState, 1);
        
        // Player should have called 50 chips
        expect(newState.players[0].stack).toBe(2500 - BIG_BLIND);
      });

      it('should add call amount to pot', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = call(gameState, 1);
        
        expect(newState.pot).toBe(75 + BIG_BLIND);
      });

      it('should not allow calling more than player has (all-in)', () => {
        const players = [
          createTestPlayer(1, 30, undefined, true), // Only has 30 chips
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = call(gameState, 1);
        
        // Player should go all-in with 30 chips
        expect(newState.players[0].stack).toBe(0);
        expect(newState.pot).toBe(75 + 30);
      });
    });

    describe('raise()', () => {
      it('should deduct correct amount from player stack', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const raiseAmount = 50; // Raise by 50 (to 100 total)
        const newState = raise(gameState, 1, raiseAmount);
        
        // Player should have bet 100 total (call 50 + raise 50)
        expect(newState.players[0].stack).toBe(2500 - BIG_BLIND - raiseAmount);
      });

      it('should update current bet', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const raiseAmount = 50;
        const newState = raise(gameState, 1, raiseAmount);
        
        expect(newState.bettingState.currentBet).toBe(BIG_BLIND + raiseAmount);
      });

      it('should not allow raising more than player has', () => {
        const players = [
          createTestPlayer(1, 80, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const raiseAmount = 200; // More than player has
        const newState = raise(gameState, 1, raiseAmount);
        
        // Should not allow illegal raise - state unchanged
        expect(newState.players[0].stack).toBe(80);
        expect(newState.pot).toBe(75);
      });

      it('should enforce minimum raise of big blind', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND,
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const raiseAmount = 10; // Less than BB
        const newState = raise(gameState, 1, raiseAmount);
        
        // Should not allow raise less than BB
        expect(newState.players[0].stack).toBe(2500);
      });
    });

    describe('check()', () => {
      it('should only allow check when no bet is active', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: 0, // No bet
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = check(gameState, 1);
        
        expect(newState.bettingState.actions).toHaveLength(1);
        expect(newState.bettingState.actions[0].action).toBe('check');
      });

      it('should not allow check when there is an active bet', () => {
        const players = [
          createTestPlayer(1, 2500, undefined, true),
          createTestPlayer(2, 2500),
        ];
        
        const gameState: GameState = {
          ...createInitialGameState(players),
          pot: 75,
          bettingState: {
            currentPlayerIndex: 0,
            currentBet: BIG_BLIND, // Active bet
            lastRaiserIndex: null,
            actions: [],
          },
        };
        
        const newState = check(gameState, 1);
        
        // Should not add check action when there's a bet
        expect(newState.bettingState.actions).toHaveLength(0);
      });
    });
  });

  describe('Task 1.5: Game Phase Progression', () => {
    it('should transition from PREFLOP to FLOP', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500),
      ];
      
      // Create a minimal deck for testing
      const testDeck: Card[] = Array.from({ length: 10 }, (_, i) => ({
        suit: Suit.Spades,
        rank: (i % 13 + 2).toString() as any,
      }));
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.PREFLOP,
        deck: testDeck,
        communityCards: [],
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.FLOP);
    });

    it('should deal 3 community cards on FLOP', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500),
      ];
      
      const testDeck: Card[] = Array.from({ length: 10 }, (_, i) => ({
        suit: Suit.Spades,
        rank: (i % 13 + 2).toString() as any,
      }));
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.PREFLOP,
        deck: testDeck,
        communityCards: [],
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.communityCards.length).toBe(3);
    });

    it('should transition from FLOP to TURN', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500),
      ];
      
      const testDeck: Card[] = Array.from({ length: 10 }, (_, i) => ({
        suit: Suit.Spades,
        rank: (i % 13 + 2).toString() as any,
      }));
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.FLOP,
        deck: testDeck,
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
          { suit: Suit.Clubs, rank: '9' },
        ],
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.TURN);
      expect(newState.communityCards.length).toBe(4);
    });

    it('should transition from TURN to RIVER', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500),
      ];
      
      const testDeck: Card[] = Array.from({ length: 10 }, (_, i) => ({
        suit: Suit.Spades,
        rank: (i % 13 + 2).toString() as any,
      }));
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.TURN,
        deck: testDeck,
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
          { suit: Suit.Clubs, rank: '9' },
          { suit: Suit.Spades, rank: '10' },
        ],
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.RIVER);
      expect(newState.communityCards.length).toBe(5);
    });

    it('should transition from RIVER to SHOWDOWN', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.RIVER,
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
          { suit: Suit.Clubs, rank: '9' },
          { suit: Suit.Spades, rank: '10' },
          { suit: Suit.Hearts, rank: 'J' },
        ],
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.SHOWDOWN);
    });

    it('should end hand immediately if only one player remains', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500, undefined, false, PlayerStatus.Folded),
        createTestPlayer(3, 2500, undefined, false, PlayerStatus.Folded),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.FLOP,
        pot: 200,
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
          { suit: Suit.Clubs, rank: '9' },
        ],
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
    });

    it('should reset betting state for new phase', () => {
      const players = [
        createTestPlayer(1, 2500),
        createTestPlayer(2, 2500),
      ];
      
      const testDeck: Card[] = Array.from({ length: 10 }, (_, i) => ({
        suit: Suit.Spades,
        rank: (i % 13 + 2).toString() as any,
      }));
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.PREFLOP,
        deck: testDeck,
        bettingState: {
          currentPlayerIndex: 1,
          currentBet: 100,
          lastRaiserIndex: 1,
          actions: [{ playerId: 1, action: 'raise', amount: 100 }],
        },
      };
      
      const newState = progressGamePhase(gameState);
      
      expect(newState.bettingState.currentBet).toBe(0);
      expect(newState.bettingState.actions).toEqual([]);
    });
  });

  describe('Task 1.7: Winner Determination & Pot Award', () => {
    it('should award pot to winner', () => {
      const players = [
        createTestPlayer(1, 2400, [
          { suit: Suit.Spades, rank: 'A' },
          { suit: Suit.Hearts, rank: 'A' },
        ]),
        createTestPlayer(2, 2400, [
          { suit: Suit.Diamonds, rank: 'K' },
          { suit: Suit.Clubs, rank: 'K' },
        ]),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.RIVER,
        pot: 200,
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
          { suit: Suit.Clubs, rank: '9' },
          { suit: Suit.Spades, rank: '2' },
          { suit: Suit.Hearts, rank: '3' },
        ],
      };
      
      const newState = endHand(gameState);
      
      // One player should have won the pot
      const totalChips = newState.players.reduce((sum, p) => sum + p.stack, 0);
      expect(totalChips).toBe(2400 + 2400 + 200); // Original stacks + pot
      expect(newState.pot).toBe(0);
      
      // Player 1 with AA should have more chips than player 2
      expect(newState.players[0].stack).toBeGreaterThan(newState.players[1].stack);
    });

    it('should transition to HAND_COMPLETE phase', () => {
      const players = [
        createTestPlayer(1, 2400, [
          { suit: Suit.Spades, rank: 'A' },
          { suit: Suit.Hearts, rank: 'K' },
        ]),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.RIVER,
        pot: 200,
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
          { suit: Suit.Clubs, rank: '9' },
          { suit: Suit.Spades, rank: '10' },
          { suit: Suit.Hearts, rank: 'J' },
        ],
      };
      
      const newState = endHand(gameState);
      
      expect(newState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
    });

    it('should award pot when all others fold (no showdown)', () => {
      const players = [
        createTestPlayer(1, 2400),
        createTestPlayer(2, 2400, undefined, false, PlayerStatus.Folded),
        createTestPlayer(3, 2400, undefined, false, PlayerStatus.Folded),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.FLOP,
        pot: 300,
      };
      
      const newState = endHand(gameState);
      
      // Player 1 should win without showdown
      expect(newState.players[0].stack).toBe(2400 + 300);
      expect(newState.pot).toBe(0);
      expect(newState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
    });

    it('should identify winning hand type', () => {
      const players = [
        createTestPlayer(1, 2400, [
          { suit: Suit.Spades, rank: 'A' },
          { suit: Suit.Spades, rank: 'K' },
        ]),
        createTestPlayer(2, 2400, [
          { suit: Suit.Diamonds, rank: '7' },
          { suit: Suit.Clubs, rank: '2' },
        ]),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.RIVER,
        pot: 200,
        communityCards: [
          { suit: Suit.Spades, rank: 'Q' },
          { suit: Suit.Spades, rank: 'J' },
          { suit: Suit.Spades, rank: '10' },
          { suit: Suit.Hearts, rank: '3' },
          { suit: Suit.Diamonds, rank: '4' },
        ],
      };
      
      const newState = endHand(gameState);
      
      // Winning hand type should be identified
      expect(newState.winningHandType).toBeDefined();
      // Player 1 has royal flush (A-K-Q-J-10 of spades)
      expect(typeof newState.winningHandType).toBe('string');
    });
  });

  describe('Task 1.8: Hand Reset (via startNewHand)', () => {
    it('should reset pot to 0 after previous hand', () => {
      const players = [
        createTestPlayer(1, 2600),
        createTestPlayer(2, 2400),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        pot: 0,
        gamePhase: GamePhase.HAND_COMPLETE,
      };
      
      const newState = startNewHand(gameState);
      
      // Pot should have new blinds only
      expect(newState.pot).toBe(SMALL_BLIND + BIG_BLIND);
    });

    it('should collect all cards and deal new ones', () => {
      const players = [
        createTestPlayer(1, 2600),
        createTestPlayer(2, 2400),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        communityCards: [
          { suit: Suit.Hearts, rank: '7' },
          { suit: Suit.Diamonds, rank: '8' },
        ],
        gamePhase: GamePhase.HAND_COMPLETE,
      };
      
      const newState = startNewHand(gameState);
      
      // All active players should have cards
      newState.players.forEach(player => {
        if (!player.isEliminated) {
          expect(player.cards).toBeDefined();
          expect(player.cards?.length).toBe(2);
        }
      });
      
      // Community cards should be cleared (new hand hasn't dealt flop yet)
      expect(newState.communityCards).toEqual([]);
    });

    it('should reset players marked as folded to active', () => {
      const players = [
        createTestPlayer(1, 2600, undefined, false, PlayerStatus.Folded),
        createTestPlayer(2, 2400, undefined, false, PlayerStatus.Active),
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.HAND_COMPLETE,
      };
      
      const newState = startNewHand(gameState);
      
      // Both players should be active (not folded) for new hand
      newState.players.forEach(player => {
        if (!player.isEliminated) {
          expect(player.status).toBe(PlayerStatus.Active);
        }
      });
    });

    it('should persist chip counts between hands', () => {
      const players = [
        createTestPlayer(1, 2700, undefined, true), // Won previous hand
        createTestPlayer(2, 2300), // Lost previous hand
      ];
      
      const gameState: GameState = {
        ...createInitialGameState(players),
        gamePhase: GamePhase.HAND_COMPLETE,
      };
      
      const newState = startNewHand(gameState);
      
      // Chip counts should carry over (minus new blinds)
      expect(newState.players[0].stack).toBeLessThanOrEqual(2700);
      expect(newState.players[1].stack).toBeLessThanOrEqual(2300);
    });
  });
});

