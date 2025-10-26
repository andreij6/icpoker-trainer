import { startNewHand, raise, SMALL_BLIND, BIG_BLIND } from './src/utils/gameActions.js';
import { GamePhase, PlayerStatus } from './src/types/index.js';
import { shuffleDeck, createDeck } from './src/utils/deck.js';

const players = [
  {
    id: 1,
    name: 'Player 1',
    avatarUrl: '',
    stack: 1000,
    status: PlayerStatus.Active,
    isEliminated: false,
  },
  {
    id: 2,
    name: 'Player 2',
    avatarUrl: '',
    stack: 1000,
    status: PlayerStatus.Active,
    isEliminated: false,
  },
];

let state = {
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

console.log('Before startNewHand:');
console.log('Pot:', state.pot);

state = startNewHand(state);

console.log('\nAfter startNewHand:');
console.log('Pot:', state.pot);
console.log('Expected pot:', SMALL_BLIND + BIG_BLIND);
console.log('Current player index:', state.bettingState.currentPlayerIndex);
console.log('Current bet:', state.bettingState.currentBet);
console.log('Actions:', state.bettingState.actions);
console.log('Player 0 stack:', state.players[0].stack);
console.log('Player 1 stack:', state.players[1].stack);

const potAfterBlinds = state.pot;
const currentPlayerId = state.players[state.bettingState.currentPlayerIndex].id;

console.log('\nRaising to 150 with player ID:', currentPlayerId);
state = raise(state, currentPlayerId, 150);

console.log('\nAfter raise:');
console.log('Pot:', state.pot);
console.log('Expected pot > ', potAfterBlinds);
console.log('Is pot > potAfterBlinds?', state.pot > potAfterBlinds);
