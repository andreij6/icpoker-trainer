/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { GamePhase, PlayerStatus } from '../src/types';
import useGameStore from '../src/store/gameStore';

describe('Task 1.1: State Management Architecture (gameStore)', () => {
  describe('Initial State', () => {
    it('should initialize with 9 players (1 human + 8 AI)', () => {
      const state = useGameStore.getState();
      
      expect(state.players).toHaveLength(9);
      
      // Verify there's exactly 1 human player
      const humanPlayers = state.players.filter(p => p.isYou);
      expect(humanPlayers).toHaveLength(1);
      
      // Verify there are 8 AI players
      const aiPlayers = state.players.filter(p => !p.isYou);
      expect(aiPlayers).toHaveLength(8);
    });

    it('should initialize all players with 2500 chips', () => {
      const state = useGameStore.getState();
      
      state.players.forEach(player => {
        expect(player.stack).toBe(2500);
      });
    });

    it('should initialize with PRE_DEAL game phase', () => {
      const state = useGameStore.getState();
      
      expect(state.gamePhase).toBe(GamePhase.PRE_DEAL);
    });

    it('should initialize with empty deck', () => {
      const state = useGameStore.getState();
      
      expect(state.deck).toEqual([]);
    });

    it('should initialize with empty community cards', () => {
      const state = useGameStore.getState();
      
      expect(state.communityCards).toEqual([]);
    });

    it('should initialize with 0 pot', () => {
      const state = useGameStore.getState();
      
      expect(state.pot).toBe(0);
    });

    it('should initialize with default betting state', () => {
      const state = useGameStore.getState();
      
      expect(state.bettingState.currentPlayerIndex).toBe(0);
      expect(state.bettingState.currentBet).toBe(0);
      expect(state.bettingState.lastRaiserIndex).toBeNull();
      expect(state.bettingState.actions).toEqual([]);
    });

    it('should initialize with dealer at position 0', () => {
      const state = useGameStore.getState();
      
      expect(state.dealerIndex).toBe(0);
    });

    it('should initialize all players as active (not eliminated)', () => {
      const state = useGameStore.getState();
      
      state.players.forEach(player => {
        expect(player.isEliminated).toBe(false);
        expect(player.status).toBe(PlayerStatus.Active);
      });
    });

    it('should give each player a unique ID', () => {
      const state = useGameStore.getState();
      
      const ids = state.players.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should give each player a unique name', () => {
      const state = useGameStore.getState();
      
      const names = state.players.map(p => p.name);
      const uniqueNames = new Set(names);
      
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should give each player an avatar URL', () => {
      const state = useGameStore.getState();
      
      state.players.forEach(player => {
        expect(player.avatarUrl).toBeDefined();
        expect(typeof player.avatarUrl).toBe('string');
        expect(player.avatarUrl.length).toBeGreaterThan(0);
      });
    });

    it('should mark exactly one player as "You"', () => {
      const state = useGameStore.getState();
      
      const humanPlayers = state.players.filter(p => p.isYou);
      expect(humanPlayers).toHaveLength(1);
      expect(humanPlayers[0].name).toBe('You');
    });
  });

  describe('Store Properties', () => {
    it('should have all required state properties', () => {
      const state = useGameStore.getState();
      
      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('deck');
      expect(state).toHaveProperty('communityCards');
      expect(state).toHaveProperty('pot');
      expect(state).toHaveProperty('gamePhase');
      expect(state).toHaveProperty('bettingState');
      expect(state).toHaveProperty('dealerIndex');
    });

    it('should have bettingState with all required properties', () => {
      const state = useGameStore.getState();
      
      expect(state.bettingState).toHaveProperty('currentPlayerIndex');
      expect(state.bettingState).toHaveProperty('currentBet');
      expect(state.bettingState).toHaveProperty('lastRaiserIndex');
      expect(state.bettingState).toHaveProperty('actions');
    });

    it('should have Player objects with all required properties', () => {
      const state = useGameStore.getState();
      const player = state.players[0];
      
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('name');
      expect(player).toHaveProperty('avatarUrl');
      expect(player).toHaveProperty('stack');
      expect(player).toHaveProperty('status');
      expect(player).toHaveProperty('isEliminated');
    });
  });

  describe('Store Accessibility', () => {
    it('should allow reading state via getState()', () => {
      const state = useGameStore.getState();
      
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    });

    it('should be accessible as a hook', () => {
      expect(typeof useGameStore).toBe('function');
    });
  });
});

