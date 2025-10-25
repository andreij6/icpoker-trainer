/**
 * Represents the four suits in a standard deck of playing cards.
 */
export enum Suit {
  /** The spades suit. */
  Spades = 'SPADES',
  /** The hearts suit. */
  Hearts = 'HEARTS',
  /** The clubs suit. */
  Clubs = 'CLUBS',
  /** The diamonds suit. */
  Diamonds = 'DIAMONDS',
}

/**
 * Represents the possible ranks of a playing card.
 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/**
 * Represents a single playing card with a suit and a rank.
 */
export interface Card {
  /** The suit of the card. */
  suit: Suit;
  /** The rank of the card. */
  rank: Rank;
  /** An optional URL to an image of the card. */
  imageUrl?: string;
}

/**
 * Represents the status of a player in the game.
 */
export enum PlayerStatus {
  /** The player is still in the hand. */
  Active = 'ACTIVE',
  /** The player has folded and is out of the hand. */
  Folded = 'FOLDED',
}

/**
 * Represents a player in the poker game.
 */
export interface Player {
  /** A unique identifier for the player. */
  id: number;
  /** The name of the player. */
  name: string;
  /** The URL of the player's avatar image. */
  avatarUrl: string;
  /** The amount of chips the player has. */
  stack: number;
  /** The player's two hole cards. Undefined if the cards are not known. */
  cards?: [Card, Card];
  /** The current status of the player in the hand. */
  status: PlayerStatus;
  /** Whether this player is the user. */
  isYou?: boolean;
  /** Whether this player is the dealer. */
  isDealer?: boolean;
  /** Whether this player has been eliminated from the game. */
  isEliminated: boolean;
  /**
   * Optional positioning information for displaying the player on the table.
   * @deprecated This property is deprecated and will be removed in a future version.
   */
  position?: {
    /** The top position of the player. */
    top?: string | number;
    /** The left position of the player. */
    left?: string | number;
    /** The right position of the player. */
    right?: string | number;
    /** The bottom position of the player. */
    bottom?: string | number;
    /** The transform style to apply to the player. */
    transform?: string;
  };
}

export enum GamePhase {
  PRE_DEAL = 'PRE_DEAL',
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN',
  HAND_COMPLETE = 'HAND_COMPLETE'
}

export interface BettingState {
  currentPlayerIndex: number;
  currentBet: number;
  lastRaiserIndex: number | null;
  actions: {
    playerId: number;
    action: 'fold' | 'call' | 'raise' | 'check' | 'bet';
    amount?: number;
  }[];
}


/**
 * Represents the overall state of the poker game at a specific moment.
 */
export interface GameState {
  /** An array of all players in the game. */
  players: Player[];
  /** The deck of cards. */
  deck: Card[];
  /** An array of cards that are common to all players. */
  communityCards: Card[];
  /** The total amount of chips in the pot. */
  pot: number;
  /** The current phase of the game. */
  gamePhase: GamePhase;
  /** The state of the current betting round. */
  bettingState: BettingState;
  /** The index of the player with the dealer button. */
  dealerIndex: number;
  /** The type of the winning hand (e.g., "Flush, Ace high"). */
  winningHandType?: string;
}

/**
 * Represents a single message in the chat between the user and the AI coach.
 */
export interface ChatMessage {
    /** The author of the message. */
    author: 'AI' | 'User';
    /** The text content of the message. */
    text: string;
}