import { Card, Suit, Rank } from '../types';

/**
 * Generates a standard 52-card deck.
 * @returns A new deck of 52 cards.
 */
export const createDeck = (): Card[] => {
  const suits: Suit[] = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm.
 * @param deck The deck to shuffle.
 * @returns A new, shuffled deck.
 */
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};

/**
 * Deals a single card from the top of the deck.
 * @param deck The deck to deal from.
 * @returns The dealt card and the new deck.
 */
export const dealCard = (deck: Card[]): { card: Card; newDeck: Card[] } => {
  if (deck.length === 0) {
    throw new Error('Cannot deal from an empty deck.');
  }
  const card = deck[0];
  const newDeck = deck.slice(1);
  return { card, newDeck };
};
