/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCard } from '../src/utils/deck';
import { Card, Suit, Rank } from '../src/types';

describe('createDeck', () => {
  it('should create a deck of 52 cards', () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);
  });

  it('should contain all unique cards with correct suits and ranks', () => {
    const deck = createDeck();
    const expectedSuits: Suit[] = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
    const expectedRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const cardSet = new Set<string>();
    for (const card of deck) {
      expect(expectedSuits).toContain(card.suit);
      expect(expectedRanks).toContain(card.rank);
      cardSet.add(`${card.rank}-${card.suit}`);
    }
    expect(cardSet.size).toBe(52);
  });
});

describe('shuffleDeck', () => {
  it('should return a deck of the same size', () => {
    const originalDeck = createDeck();
    const shuffledDeck = shuffleDeck(originalDeck);
    expect(shuffledDeck.length).toBe(originalDeck.length);
  });

  it('should contain the same cards as the original deck', () => {
    const originalDeck = createDeck();
    const shuffledDeck = shuffleDeck(originalDeck);

    const originalCardStrings = originalDeck.map(card => `${card.rank}-${card.suit}`).sort();
    const shuffledCardStrings = shuffledDeck.map(card => `${card.rank}-${card.suit}`).sort();

    expect(shuffledCardStrings).toEqual(originalCardStrings);
  });

  it('should randomize the order of cards (non-deterministic check)', () => {
    const originalDeck = createDeck();
    let isShuffled = false;
    for (let i = 0; i < 10; i++) { // Try multiple shuffles to increase confidence
      const shuffledDeck = shuffleDeck(originalDeck);
      if (JSON.stringify(originalDeck) !== JSON.stringify(shuffledDeck)) {
        isShuffled = true;
        break;
      }
    }
    expect(isShuffled).toBe(true);
  });
});

describe('dealCard', () => {
  it('should return a single card and reduce deck size by one', () => {
    const originalDeck = createDeck();
    const initialLength = originalDeck.length;
    const { card, newDeck } = dealCard(originalDeck);

    expect(card).toBeDefined();
    expect(newDeck.length).toBe(initialLength - 1);
    expect(newDeck).not.toContain(card); // The dealt card should no longer be in the deck
  });

  it('should deal the top card of the deck', () => {
    const originalDeck = createDeck();
    const topCard = originalDeck[0];
    const { card } = dealCard(originalDeck);
    expect(card).toEqual(topCard);
  });

  it('should throw an error when dealing from an empty deck', () => {
    const emptyDeck: Card[] = [];
    expect(() => dealCard(emptyDeck)).toThrow('Cannot deal from an empty deck.');
  });
});
