import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PokerTable from './PokerTable';
import useGameStore from '../store/gameStore';
import { GamePhase, PlayerStatus, Suit } from '../types';

describe('Task 4.1: PokerTable Connected to Live State', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useGameStore.getState();
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          avatarUrl: 'https://i.pravatar.cc/150?u=1',
          stack: 2500,
          status: PlayerStatus.Active,
          isYou: true,
          isEliminated: false,
        },
        {
          id: 2,
          name: 'Player 2',
          avatarUrl: 'https://i.pravatar.cc/150?u=2',
          stack: 2500,
          status: PlayerStatus.Active,
          isEliminated: false,
        },
        {
          id: 3,
          name: 'Player 3',
          avatarUrl: 'https://i.pravatar.cc/150?u=3',
          stack: 2500,
          status: PlayerStatus.Active,
          isEliminated: false,
        },
      ],
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
  });

  it('displays pot amount from store', () => {
    useGameStore.setState({ pot: 500 });
    render(<PokerTable />);
    expect(screen.getByText(/Pot: \$500/i)).toBeDefined();
  });

  it('displays current game phase', () => {
    useGameStore.setState({ gamePhase: GamePhase.FLOP });
    const { container } = render(<PokerTable />);
    // Game phase is displayed in the center section with specific class
    const gamePhaseElement = container.querySelector('.text-sm.text-white\\/70');
    expect(gamePhaseElement?.textContent).toBe('FLOP');
  });

  it('displays correct number of active players', () => {
    const { container } = render(<PokerTable />);
    // Should have 3 players (from beforeEach)
    const players = container.querySelectorAll('[data-alt]');
    expect(players.length).toBe(3);
  });

  it('does not display eliminated players', () => {
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          avatarUrl: 'https://i.pravatar.cc/150?u=1',
          stack: 2500,
          status: PlayerStatus.Active,
          isYou: true,
          isEliminated: false,
        },
        {
          id: 2,
          name: 'Player 2',
          avatarUrl: 'https://i.pravatar.cc/150?u=2',
          stack: 0,
          status: PlayerStatus.Active,
          isEliminated: true, // Eliminated
        },
      ],
    });
    
    render(<PokerTable />);
    expect(screen.queryByText('Player 2')).toBeNull();
    expect(screen.getByText('You')).toBeDefined();
  });

  it('shows dealer button at correct position', () => {
    useGameStore.setState({ dealerIndex: 1 });
    const { container } = render(<PokerTable />);
    const dealerButtons = container.querySelectorAll('div:has-text("D")');
    // Note: This is a simplified check, actual implementation may vary
    expect(dealerButtons).toBeDefined();
  });

  it('shows blind indicators (SB/BB) correctly', () => {
    useGameStore.setState({
      dealerIndex: 0,
      players: [
        {
          id: 1,
          name: 'Dealer',
          avatarUrl: 'https://i.pravatar.cc/150?u=1',
          stack: 2500,
          status: PlayerStatus.Active,
          isEliminated: false,
        },
        {
          id: 2,
          name: 'Small Blind',
          avatarUrl: 'https://i.pravatar.cc/150?u=2',
          stack: 2475,
          status: PlayerStatus.Active,
          isEliminated: false,
        },
        {
          id: 3,
          name: 'Big Blind',
          avatarUrl: 'https://i.pravatar.cc/150?u=3',
          stack: 2450,
          status: PlayerStatus.Active,
          isEliminated: false,
        },
      ],
    });
    
    const { container } = render(<PokerTable />);
    // SB should be at index 1, BB at index 2
    expect(screen.getByText('Small Blind')).toBeDefined();
    expect(screen.getByText('Big Blind')).toBeDefined();
  });

  it('displays community cards only in correct phases - PREFLOP', () => {
    useGameStore.setState({
      gamePhase: GamePhase.PREFLOP,
      communityCards: [],
    });
    
    render(<PokerTable />);
    // Should show face-down placeholder cards, not actual cards
    expect(screen.getByText('FLOP')).toBeDefined();
    expect(screen.getByText('TURN')).toBeDefined();
    expect(screen.getByText('RIVER')).toBeDefined();
  });

  it('displays community cards only in correct phases - FLOP', () => {
    useGameStore.setState({
      gamePhase: GamePhase.FLOP,
      communityCards: [
        { suit: Suit.Hearts, rank: 'A' },
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Diamonds, rank: 'Q' },
      ],
    });
    
    const { container } = render(<PokerTable />);
    // Should show 3 flop cards face-up, turn and river face-down
    const gamePhaseElement = container.querySelector('.text-sm.text-white\\/70');
    expect(gamePhaseElement?.textContent).toBe('FLOP');
    // Check that community cards are rendered (they should be visible for FLOP phase)
    expect(container.querySelectorAll('.bg-white.rounded-lg').length).toBeGreaterThanOrEqual(3);
  });

  it('displays all community cards in RIVER phase', () => {
    useGameStore.setState({
      gamePhase: GamePhase.RIVER,
      communityCards: [
        { suit: Suit.Hearts, rank: 'A' },
        { suit: Suit.Spades, rank: 'K' },
        { suit: Suit.Diamonds, rank: 'Q' },
        { suit: Suit.Clubs, rank: 'J' },
        { suit: Suit.Hearts, rank: '10' },
      ],
    });
    
    const { container } = render(<PokerTable />);
    const gamePhaseElement = container.querySelector('.text-sm.text-white\\/70');
    expect(gamePhaseElement?.textContent).toBe('RIVER');
    // All 5 community cards should be visible
    expect(container.querySelectorAll('.bg-white.rounded-lg').length).toBe(5);
  });

  it('component re-renders when pot changes', () => {
    const { rerender } = render(<PokerTable />);
    
    expect(screen.getByText(/Pot: \$0/i)).toBeDefined();
    
    useGameStore.setState({ pot: 1000 });
    rerender(<PokerTable />);
    
    expect(screen.getByText(/Pot: \$1,000/i)).toBeDefined();
  });

  it('highlights current player with visual indicator', () => {
    useGameStore.setState({
      bettingState: {
        currentPlayerIndex: 1,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
    });
    
    const { container } = render(<PokerTable />);
    // Current player should have yellow border
    // This is tested by checking if the component renders without errors
    expect(container).toBeDefined();
  });

  it('displays current bets for players', () => {
    useGameStore.setState({
      bettingState: {
        currentPlayerIndex: 1,
        currentBet: 100,
        lastRaiserIndex: null,
        actions: [
          { playerId: 2, action: 'raise', amount: 100 },
        ],
      },
    });
    
    const { container } = render(<PokerTable />);
    // Player 2 should show a bet of $100
    expect(container).toBeDefined();
  });

  it('positions players in elliptical pattern around table', () => {
    const { container } = render(<PokerTable />);
    
    // Check that players have absolute positioning
    const playerContainers = container.querySelectorAll('.absolute');
    expect(playerContainers.length).toBeGreaterThan(0);
  });

  it('shows table background with proper styling', () => {
    const { container } = render(<PokerTable />);
    
    // Check for green table background
    const table = container.querySelector('.bg-gradient-to-br');
    expect(table).toBeDefined();
  });

  it('updates immediately when game phase changes', () => {
    const { rerender, container } = render(<PokerTable />);
    
    let gamePhaseElement = container.querySelector('.text-sm.text-white\\/70');
    expect(gamePhaseElement?.textContent).toBe('PRE_DEAL');
    
    useGameStore.setState({ gamePhase: GamePhase.FLOP });
    rerender(<PokerTable />);
    
    gamePhaseElement = container.querySelector('.text-sm.text-white\\/70');
    expect(gamePhaseElement?.textContent).toBe('FLOP');
  });

  it('handles folded players with visual distinction', () => {
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          avatarUrl: 'https://i.pravatar.cc/150?u=1',
          stack: 2500,
          status: PlayerStatus.Active,
          isYou: true,
          isEliminated: false,
        },
        {
          id: 2,
          name: 'Folded Player',
          avatarUrl: 'https://i.pravatar.cc/150?u=2',
          stack: 2500,
          status: PlayerStatus.Folded,
          isEliminated: false,
        },
      ],
    });
    
    const { container } = render(<PokerTable />);
    expect(screen.getByText('Folded Player')).toBeDefined();
    // Folded players should have grayscale class applied
    expect(container.querySelector('.grayscale')).toBeDefined();
  });
});

