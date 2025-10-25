import { create } from 'zustand';
import { GameState, Player, GamePhase, PlayerStatus } from '../types';

const createInitialPlayers = (): Player[] => {
  const players: Player[] = [];
  // Add the user
  players.push({
    id: 1,
    name: 'You',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    stack: 2500,
    status: PlayerStatus.Active,
    isYou: true,
    isEliminated: false,
  });
  // Add AI players
  for (let i = 2; i <= 9; i++) {
    players.push({
      id: i,
      name: `Player ${i}`,
      avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
      stack: 2500,
      status: PlayerStatus.Active,
      isEliminated: false,
    });
  }
  return players;
};

const useGameStore = create<GameState>((set) => ({
  players: createInitialPlayers(),
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
}));

export default useGameStore;
