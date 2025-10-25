export enum Suit {
  Spades = 'SPADES',
  Hearts = 'HEARTS',
  Clubs = 'CLUBS',
  Diamonds = 'DIAMONDS',
}

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  imageUrl?: string;
}

export enum PlayerStatus {
  Active = 'ACTIVE',
  Folded = 'FOLDED',
}

export interface Player {
  id: number;
  name: string;
  avatarUrl: string;
  stack: number;
  cards?: [Card, Card];
  status: PlayerStatus;
  isYou?: boolean;
  isDealer?: boolean;
  // FIX: Add optional position property to Player interface.
  position?: {
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    transform?: string;
  };
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
}

export interface ChatMessage {
    author: 'AI' | 'User';
    text: string;
}