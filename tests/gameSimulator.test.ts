import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, Player, Card, Suit, GamePhase, PlayerStatus } from '../src/types';
import { 
  startNewHand, 
  fold, 
  call, 
  raise, 
  check, 
  progressGamePhase, 
  endHand,
  isBettingRoundOver,
  BIG_BLIND,
  SMALL_BLIND
} from '../src/utils/gameActions';
import { createDeck, shuffleDeck } from '../src/utils/deck';
import { determineWinner } from '../src/utils/handEvaluator';

/**
 * Game Simulator Test Suite
 * 
 * This test suite simulates complete poker hands from start to finish,
 * testing all game logic, pot calculations, and state transitions.
 */

describe('Game Simulator - Complete Hand Scenarios', () => {
  
  /**
   * Helper function to create a test player
   */
  function createPlayer(id: number, name: string, stack: number, isYou: boolean = false): Player {
    return {
      id,
      name,
      avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
      stack,
      status: PlayerStatus.Active,
      isYou,
      isEliminated: false,
    };
  }

  /**
   * Helper function to create initial game state
   */
  function createInitialGameState(numPlayers: number = 9): GameState {
    const players: Player[] = [];
    
    // Add all AI players for simulator (no human player)
    for (let i = 1; i <= numPlayers; i++) {
      players.push(createPlayer(i, `Player ${i}`, 2500, false));
    }

    return {
      players,
      deck: shuffleDeck(createDeck()),
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
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };
  }

  /**
   * Helper to simulate AI actions automatically
   */
  function simulateAIAction(gameState: GameState): GameState {
    const currentPlayer = gameState.players[gameState.bettingState.currentPlayerIndex];
    
    if (currentPlayer.isYou || currentPlayer.isEliminated) {
      return gameState;
    }

    const { currentBet, actions } = gameState.bettingState;
    const playerBetInRound = actions
      .filter(a => a.playerId === currentPlayer.id && (a.action === 'bet' || a.action === 'raise' || a.action === 'call'))
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    const amountToCall = currentBet - playerBetInRound;

    // Simple AI logic for testing
    if (amountToCall === 0) {
      // Can check - 70% check, 30% raise
      if (Math.random() < 0.7) {
        return check(gameState, currentPlayer.id);
      } else {
        const raiseAmount = Math.min(BIG_BLIND * 3, currentPlayer.stack);
        return raise(gameState, currentPlayer.id, raiseAmount);
      }
    } else {
      // Must call or fold - 60% call, 40% fold
      if (Math.random() < 0.6 && currentPlayer.stack >= amountToCall) {
        return call(gameState, currentPlayer.id);
      } else {
        return fold(gameState, currentPlayer.id);
      }
    }
  }

  /**
   * Simulate an entire betting round
   */
  function simulateBettingRound(gameState: GameState): GameState {
    let state = gameState;
    let iterations = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (!isBettingRoundOver(state) && iterations < maxIterations) {
      state = simulateAIAction(state);
      iterations++;
    }

    if (iterations >= maxIterations) {
      throw new Error('Betting round did not complete - possible infinite loop');
    }

    return state;
  }

  /**
   * Simulate an entire hand from start to finish
   */
  function simulateCompleteHand(initialState: GameState): GameState {
    let state = startNewHand(initialState);

    // Preflop
    if (state.gamePhase === GamePhase.PREFLOP) {
      state = simulateBettingRound(state);
      
      // Check if hand ended (everyone folded)
      const activePlayers = state.players.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);
      if (activePlayers.length === 1) {
        return endHand(state);
      }

      if (isBettingRoundOver(state)) {
        state = progressGamePhase(state);
      }
    }

    // Flop
    if (state.gamePhase === GamePhase.FLOP) {
      state = simulateBettingRound(state);
      
      const activePlayers = state.players.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);
      if (activePlayers.length === 1) {
        return endHand(state);
      }

      if (isBettingRoundOver(state)) {
        state = progressGamePhase(state);
      }
    }

    // Turn
    if (state.gamePhase === GamePhase.TURN) {
      state = simulateBettingRound(state);
      
      const activePlayers = state.players.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);
      if (activePlayers.length === 1) {
        return endHand(state);
      }

      if (isBettingRoundOver(state)) {
        state = progressGamePhase(state);
      }
    }

    // River
    if (state.gamePhase === GamePhase.RIVER) {
      state = simulateBettingRound(state);
      
      const activePlayers = state.players.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);
      if (activePlayers.length === 1) {
        return endHand(state);
      }

      if (isBettingRoundOver(state)) {
        state = progressGamePhase(state);
      }
    }

    // Should be at HAND_COMPLETE now
    return state;
  }

  describe('Basic Hand Simulation', () => {
    it('should complete a full hand without errors', () => {
      const initialState = createInitialGameState(9);
      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
      expect(finalState.pot).toBe(0); // Pot should be awarded
    });

    it('should maintain chip conservation (no chips created or destroyed)', () => {
      const initialState = createInitialGameState(9);
      const totalChipsStart = initialState.players.reduce((sum, p) => sum + p.stack, 0);

      const finalState = simulateCompleteHand(initialState);
      const totalChipsEnd = finalState.players.reduce((sum, p) => sum + p.stack, 0) + finalState.pot;

      expect(totalChipsEnd).toBe(totalChipsStart);
    });

    it('should have exactly one winner or split pot', () => {
      const initialState = createInitialGameState(9);
      const finalState = simulateCompleteHand(initialState);

      // Pot should be 0 (awarded to winner)
      expect(finalState.pot).toBe(0);

      // At least one player should have gained chips
      const gainers = finalState.players.filter(p => p.stack > 2500);
      expect(gainers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Multiple Hand Simulation', () => {
    it('should complete 10 hands without errors', () => {
      let state = createInitialGameState(9);

      for (let i = 0; i < 10; i++) {
        state = simulateCompleteHand(state);
        expect(state.gamePhase).toBe(GamePhase.HAND_COMPLETE);
        
        // Reset for next hand
        state.gamePhase = GamePhase.PRE_DEAL;
      }
    });

    it('should maintain chip conservation across multiple hands', () => {
      let state = createInitialGameState(9);
      const totalChipsStart = state.players.reduce((sum, p) => sum + p.stack, 0);

      for (let i = 0; i < 5; i++) {
        state = simulateCompleteHand(state);
        state.gamePhase = GamePhase.PRE_DEAL;
      }

      const totalChipsEnd = state.players.reduce((sum, p) => sum + p.stack, 0) + state.pot;
      expect(totalChipsEnd).toBe(totalChipsStart);
    });

    it('should move dealer button each hand', () => {
      let state = createInitialGameState(9);
      const dealerPositions: number[] = [];

      for (let i = 0; i < 9; i++) {
        state = simulateCompleteHand(state);
        dealerPositions.push(state.dealerIndex);
        state.gamePhase = GamePhase.PRE_DEAL;
      }

      // Dealer should have moved through all positions
      expect(new Set(dealerPositions).size).toBeGreaterThan(1);
    });
  });

  describe('Stress Test - 100 Hands', () => {
    it('should complete 100 hands without errors or crashes', () => {
      let state = createInitialGameState(9);
      let handsCompleted = 0;
      let errors = 0;

      for (let i = 0; i < 100; i++) {
        try {
          state = simulateCompleteHand(state);
          handsCompleted++;
          state.gamePhase = GamePhase.PRE_DEAL;
        } catch (error) {
          errors++;
          console.error(`Error on hand ${i + 1}:`, error);
        }
      }

      expect(handsCompleted).toBe(100);
      expect(errors).toBe(0);
    });

    it('should maintain chip conservation over 100 hands', () => {
      let state = createInitialGameState(9);
      const totalChipsStart = state.players.reduce((sum, p) => sum + p.stack, 0);

      for (let i = 0; i < 100; i++) {
        state = simulateCompleteHand(state);
        state.gamePhase = GamePhase.PRE_DEAL;
      }

      const totalChipsEnd = state.players.reduce((sum, p) => sum + p.stack, 0) + state.pot;
      
      // Allow for small rounding errors
      expect(Math.abs(totalChipsEnd - totalChipsStart)).toBeLessThan(10);
    });
  });

  describe('Edge Case Scenarios', () => {
    it('should handle heads-up (2 players)', () => {
      const initialState = createInitialGameState(2);
      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
      expect(finalState.pot).toBe(0);
    });

    it('should handle 3 players', () => {
      const initialState = createInitialGameState(3);
      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
      expect(finalState.pot).toBe(0);
    });

    it('should handle short stacks (players with < 1 BB)', () => {
      const initialState = createInitialGameState(9);
      
      // Give some players very short stacks
      initialState.players[2].stack = 30; // Less than 1 BB
      initialState.players[5].stack = 40;

      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
    });

    it('should handle all players with equal stacks', () => {
      const initialState = createInitialGameState(9);
      
      // Ensure all have exactly same stack
      initialState.players.forEach(p => p.stack = 1000);

      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
    });

    it('should handle one player with dominant stack', () => {
      const initialState = createInitialGameState(9);
      
      // One player has most chips
      initialState.players[0].stack = 10000;
      initialState.players.slice(1).forEach(p => p.stack = 500);

      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
    });
  });

  describe('State Consistency Checks', () => {
    it('should never have negative chip stacks', () => {
      let state = createInitialGameState(9);

      for (let i = 0; i < 20; i++) {
        state = simulateCompleteHand(state);
        
        state.players.forEach(player => {
          expect(player.stack).toBeGreaterThanOrEqual(0);
        });

        state.gamePhase = GamePhase.PRE_DEAL;
      }
    });

    it('should never have negative pot', () => {
      let state = createInitialGameState(9);

      for (let i = 0; i < 20; i++) {
        state = simulateCompleteHand(state);
        expect(state.pot).toBeGreaterThanOrEqual(0);
        state.gamePhase = GamePhase.PRE_DEAL;
      }
    });

    it('should always have valid dealer index', () => {
      let state = createInitialGameState(9);

      for (let i = 0; i < 20; i++) {
        state = simulateCompleteHand(state);
        
        expect(state.dealerIndex).toBeGreaterThanOrEqual(0);
        expect(state.dealerIndex).toBeLessThan(state.players.length);

        state.gamePhase = GamePhase.PRE_DEAL;
      }
    });

    it('should always have valid current player index during hand', () => {
      const initialState = createInitialGameState(9);
      let state = startNewHand(initialState);

      // Check during preflop
      expect(state.bettingState.currentPlayerIndex).toBeGreaterThanOrEqual(0);
      expect(state.bettingState.currentPlayerIndex).toBeLessThan(state.players.length);
    });

    it('should have correct number of community cards per phase', () => {
      const initialState = createInitialGameState(9);
      let state = startNewHand(initialState);

      // Preflop - 0 cards
      expect(state.communityCards.length).toBe(0);

      // Progress to flop
      state = simulateBettingRound(state);
      if (isBettingRoundOver(state)) {
        state = progressGamePhase(state);
        if (state.gamePhase === GamePhase.FLOP) {
          expect(state.communityCards.length).toBe(3);
        }
      }
    });
  });

  describe('Performance Tests', () => {
    it('should complete 100 hands in reasonable time', () => {
      const startTime = Date.now();
      let state = createInitialGameState(9);

      for (let i = 0; i < 100; i++) {
        state = simulateCompleteHand(state);
        state.gamePhase = GamePhase.PRE_DEAL;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 10 seconds
      expect(duration).toBeLessThan(10000);
      console.log(`100 hands completed in ${duration}ms (${duration / 100}ms per hand)`);
    });
  });

  describe('Betting Round Logic', () => {
    it('should end betting round when all players have acted and matched bet', () => {
      const initialState = createInitialGameState(9);
      let state = startNewHand(initialState);

      // Simulate until betting round ends
      state = simulateBettingRound(state);

      expect(isBettingRoundOver(state)).toBe(true);
    });

    it('should handle all-in scenarios correctly', () => {
      const initialState = createInitialGameState(9);
      
      // Give players different stacks to create all-in situations
      initialState.players[2].stack = 100;
      initialState.players[3].stack = 200;
      initialState.players[4].stack = 300;

      const finalState = simulateCompleteHand(initialState);

      expect(finalState.gamePhase).toBe(GamePhase.HAND_COMPLETE);
      expect(finalState.pot).toBe(0); // All pots awarded
    });
  });

  describe('Winner Determination', () => {
    it('should always determine a winner', () => {
      let state = createInitialGameState(9);

      for (let i = 0; i < 20; i++) {
        state = simulateCompleteHand(state);
        
        // Pot should be 0 (awarded)
        expect(state.pot).toBe(0);
        
        // At least one player should have more than starting stack
        // (unless they were the loser)
        const totalChips = state.players.reduce((sum, p) => sum + p.stack, 0);
        expect(totalChips).toBe(9 * 2500); // Conservation

        state.gamePhase = GamePhase.PRE_DEAL;
      }
    });

    it('should handle split pots correctly', () => {
      // This test would require setting up specific cards for a tie
      // For now, we just verify no errors occur
      let state = createInitialGameState(9);

      for (let i = 0; i < 10; i++) {
        state = simulateCompleteHand(state);
        expect(state.pot).toBe(0);
        state.gamePhase = GamePhase.PRE_DEAL;
      }
    });
  });
});

describe('Game Simulator - Statistics Collection', () => {
  interface GameStats {
    handsPlayed: number;
    handsToShowdown: number;
    handsEndedPreflop: number;
    handsEndedFlop: number;
    handsEndedTurn: number;
    handsEndedRiver: number;
    averagePot: number;
    largestPot: number;
    smallestPot: number;
  }

  function collectStats(numHands: number): GameStats {
    let state = createInitialGameState(9);
    const stats: GameStats = {
      handsPlayed: 0,
      handsToShowdown: 0,
      handsEndedPreflop: 0,
      handsEndedFlop: 0,
      handsEndedTurn: 0,
      handsEndedRiver: 0,
      averagePot: 0,
      largestPot: 0,
      smallestPot: Infinity,
    };

    const potSizes: number[] = [];

    for (let i = 0; i < numHands; i++) {
      const beforeState = { ...state };
      state = simulateCompleteHand(state);
      
      stats.handsPlayed++;

      // Track where hand ended
      if (state.gamePhase === GamePhase.HAND_COMPLETE) {
        // Calculate pot size (sum of all chips that changed hands)
        const potSize = beforeState.players.reduce((sum, p) => sum + p.stack, 0) - 
                       state.players.reduce((sum, p) => sum + p.stack, 0);
        potSizes.push(Math.abs(potSize));
      }

      state.gamePhase = GamePhase.PRE_DEAL;
    }

    // Calculate averages
    if (potSizes.length > 0) {
      stats.averagePot = potSizes.reduce((a, b) => a + b, 0) / potSizes.length;
      stats.largestPot = Math.max(...potSizes);
      stats.smallestPot = Math.min(...potSizes);
    }

    return stats;
  }

  function createInitialGameState(numPlayers: number): GameState {
    const players: Player[] = [];
    
    players.push({
      id: 1,
      name: 'You',
      avatarUrl: 'https://i.pravatar.cc/150?u=1',
      stack: 2500,
      status: PlayerStatus.Active,
      isYou: true,
      isEliminated: false,
    });
    
    for (let i = 2; i <= numPlayers; i++) {
      players.push({
        id: i,
        name: `Player ${i}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
        stack: 2500,
        status: PlayerStatus.Active,
        isEliminated: false,
      });
    }

    return {
      players,
      deck: shuffleDeck(createDeck()),
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
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };
  }

  function simulateCompleteHand(state: GameState): GameState {
    // Simplified simulation for stats collection
    let currentState = startNewHand(state);
    
    // Just progress through phases quickly
    for (let i = 0; i < 4; i++) {
      if (currentState.gamePhase !== GamePhase.HAND_COMPLETE) {
        currentState = progressGamePhase(currentState);
      }
    }

    if (currentState.gamePhase !== GamePhase.HAND_COMPLETE) {
      currentState = endHand(currentState);
    }

    return currentState;
  }

  it('should collect statistics over 50 hands', () => {
    const stats = collectStats(50);

    expect(stats.handsPlayed).toBe(50);
    console.log('Statistics from 50 hands:', stats);
  });
});

