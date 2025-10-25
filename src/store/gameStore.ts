import { create } from 'zustand';
import { GameState, Player, GamePhase, PlayerStatus } from '../types';
import { fold, call, raise, check, startNewHand, endHand } from '../utils/gameActions';

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

interface GameStore extends GameState {
  // Actions
  playerFold: (playerId: number) => void;
  playerCall: (playerId: number) => void;
  playerRaise: (playerId: number, raiseAmount: number) => void;
  playerCheck: (playerId: number) => void;
  startNewHand: () => void;
  skipToNextHand: () => void;
  updateState: (newState: Partial<GameState>) => void;
  // Toast callback (set by ToastProvider)
  setToastCallback: (callback: (message: string, type?: string) => void) => void;
  toastCallback?: (message: string, type?: string) => void;
  // Coach event callback to append action messages to the coach panel
  setCoachEventCallback: (callback: (msg: { text: string; type: 'action'; actionType?: string }) => void) => void;
  coachEventCallback?: (msg: { text: string; type: 'action'; actionType?: string }) => void;
  // Control AI autoplay when skipping rounds
  isAutoPlaying: boolean;
  setAutoPlaying: (value: boolean) => void;
  // Prevent AI from acting immediately after new hand
  isHandStarting: boolean;
  setHandStarting: (value: boolean) => void;
  // Coach settings
  autoAdviceEnabled: boolean;
  setAutoAdviceEnabled: (value: boolean) => void;
}

const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
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
  lastWinner: undefined,
  lastWinningHandType: undefined,
  isAutoPlaying: false,
  isHandStarting: false,
  autoAdviceEnabled: ((): boolean => {
    try {
      const v = localStorage.getItem('coach:autoAdviceEnabled');
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  })(),
  
  // Actions
  playerFold: (playerId: number) => {
    const currentState = get();
    const player = currentState.players.find(p => p.id === playerId);
    const newState = fold(currentState, playerId);
    set(newState);
    
    // Coach event instead of toast
    const coach = get().coachEventCallback;
    if (coach && player) {
      const text = player.isYou ? 'You folded' : `${player.name} folds`;
      coach({ text, type: 'action', actionType: 'fold' });
    }
  },
  
  playerCall: (playerId: number) => {
    const currentState = get();
    const player = currentState.players.find(p => p.id === playerId);
    const currentPlayerBet = currentState.bettingState.actions
      .filter(a => a.playerId === playerId)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    const callAmount = currentState.bettingState.currentBet - currentPlayerBet;
    const newState = call(currentState, playerId);
    set(newState);
    
    const coach = get().coachEventCallback;
    if (coach && player) {
      const text = player.isYou ? `You called $${callAmount.toLocaleString()}` : `${player.name} calls $${callAmount.toLocaleString()}`;
      coach({ text, type: 'action', actionType: 'call' });
    }
  },
  
  playerRaise: (playerId: number, raiseAmount: number) => {
    const currentState = get();
    const player = currentState.players.find(p => p.id === playerId);
    const newState = raise(currentState, playerId, raiseAmount);
    set(newState);
    
    const coach = get().coachEventCallback;
    if (coach && player) {
      const text = player.isYou ? `You raised to $${raiseAmount.toLocaleString()}` : `${player.name} raises to $${raiseAmount.toLocaleString()}`;
      coach({ text, type: 'action', actionType: 'raise' });
    }
  },
  
  playerCheck: (playerId: number) => {
    const currentState = get();
    const player = currentState.players.find(p => p.id === playerId);
    const newState = check(currentState, playerId);
    set(newState);
    
    const coach = get().coachEventCallback;
    if (coach && player) {
      const text = player.isYou ? 'You checked' : `${player.name} checks`;
      coach({ text, type: 'action', actionType: 'check' });
    }
  },
  
  startNewHand: () => {
    const currentState = get();
    const newState = startNewHand(currentState);
    
    // Set flag to prevent AI from acting immediately
    set({ ...newState, isHandStarting: true });
    
    // Coach event instead of toast
    const coach = get().coachEventCallback;
    if (!coach) {
      // Clear flag after delay even if no coach
      setTimeout(() => set({ isHandStarting: false }), 500);
      return;
    }
    
    // Find dealer, blinds, and user
    const dealerPlayer = newState.players[newState.dealerIndex];
    const activePlayers = newState.players.filter(p => !p.isEliminated);
    
    // Find small blind (first active player after dealer)
    let sbIndex = -1;
    let currentIndex = newState.dealerIndex;
    for (let i = 0; i < newState.players.length; i++) {
      currentIndex = (currentIndex + 1) % newState.players.length;
      if (!newState.players[currentIndex].isEliminated) {
        sbIndex = currentIndex;
        break;
      }
    }
    
    // Find big blind (first active player after small blind)
    let bbIndex = -1;
    currentIndex = sbIndex;
    for (let i = 0; i < newState.players.length; i++) {
      currentIndex = (currentIndex + 1) % newState.players.length;
      if (!newState.players[currentIndex].isEliminated) {
        bbIndex = currentIndex;
        break;
      }
    }
    
    const sbPlayer = sbIndex !== -1 ? newState.players[sbIndex] : null;
    const bbPlayer = bbIndex !== -1 ? newState.players[bbIndex] : null;
    const userPlayer = newState.players.find(p => p.isYou);
    
    // Emit messages
    coach({ text: `Dealer advances button to ${dealerPlayer.name}`, type: 'action', actionType: 'newhand' });
    coach({ text: 'Dealer starts a new hand', type: 'action', actionType: 'newhand' });
    
    if (sbPlayer) {
      const sbText = sbPlayer.isYou ? 'You post small blind $25' : `${sbPlayer.name} posts small blind $25`;
      coach({ text: sbText, type: 'action', actionType: 'blind' });
    }
    
    if (bbPlayer) {
      const bbText = bbPlayer.isYou ? 'You post big blind $50' : `${bbPlayer.name} posts big blind $50`;
      coach({ text: bbText, type: 'action', actionType: 'blind' });
    }
    
    // Call out user position
    if (userPlayer && !userPlayer.isEliminated) {
      const userIndex = newState.players.findIndex(p => p.isYou);
      const firstToAct = newState.bettingState.currentPlayerIndex;
      
      // Determine position
      let positionText = '';
      
      if (userIndex === newState.dealerIndex) {
        positionText = 'You are on the button';
      } else if (userIndex === sbIndex) {
        positionText = 'You are in the small blind';
      } else if (userIndex === bbIndex) {
        positionText = 'You are in the big blind';
      } else if (userIndex === firstToAct) {
        positionText = 'You are under the gun (UTG)';
      } else {
        // Calculate position relative to dealer
        const activePlayers = newState.players.filter(p => !p.isEliminated);
        const activeCount = activePlayers.length;
        
        // Find position number (1 = UTG, 2 = UTG+1, etc.)
        let positionFromUTG = 0;
        let checkIndex = firstToAct;
        for (let i = 0; i < activeCount; i++) {
          if (checkIndex === userIndex) {
            positionFromUTG = i;
            break;
          }
          checkIndex = (checkIndex + 1) % newState.players.length;
          while (newState.players[checkIndex].isEliminated) {
            checkIndex = (checkIndex + 1) % newState.players.length;
          }
        }
        
        if (positionFromUTG === 1) {
          positionText = 'You are UTG+1';
        } else if (positionFromUTG === activeCount - 3) {
          positionText = 'You are in the cutoff';
        } else if (positionFromUTG > 1) {
          positionText = `You are in middle position`;
        }
      }
      
      if (positionText) {
        coach({ text: positionText, type: 'action', actionType: 'newhand' });
      }
    }
    
    // Clear the flag after a short delay to allow game to start
    setTimeout(() => {
      set({ isHandStarting: false });
    }, 500);
  },
  
  skipToNextHand: () => {
    const currentState = get();
    const ended = endHand(currentState);
    set(ended);
    // Call the store's startNewHand action to get proper messaging
    get().startNewHand();
  },
  
  updateState: (newState: Partial<GameState>) => {
    set((state) => ({ ...state, ...newState }));
  },
  
  setToastCallback: (callback: (message: string, type?: string) => void) => {
    set({ toastCallback: callback });
  },
  setCoachEventCallback: (callback: (msg: { text: string; type: 'action' }) => void) => {
    set({ coachEventCallback: callback });
  },
  
  setAutoPlaying: (value: boolean) => set({ isAutoPlaying: value }),
  setHandStarting: (value: boolean) => set({ isHandStarting: value }),
  
  setAutoAdviceEnabled: (value: boolean) => {
    set({ autoAdviceEnabled: value });
    try { localStorage.setItem('coach:autoAdviceEnabled', String(value)); } catch {}
  },
}));

export default useGameStore;
