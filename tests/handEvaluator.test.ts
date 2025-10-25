import { describe, it, expect } from 'vitest';
import { evaluateHand, determineWinner } from '../utils/handEvaluator';
import { Card, Suit, Rank, Player, PlayerStatus } from '../types';
import { Hand } from 'pokersolver';

// Helper function to create a card
const createCard = (rank: Rank, suit: Suit): Card => ({ rank, suit });

describe('evaluateHand', () => {
  it('should correctly identify a Royal Flush', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('K', Suit.Spades)];
    const communityCards: Card[] = [
      createCard('Q', Suit.Spades),
      createCard('J', Suit.Spades),
      createCard('10', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Royal Flush');
  });

  it('should correctly identify a Straight Flush', () => {
    const holeCards: [Card, Card] = [createCard('9', Suit.Clubs), createCard('8', Suit.Clubs)];
    const communityCards: Card[] = [
      createCard('7', Suit.Clubs),
      createCard('6', Suit.Clubs),
      createCard('5', Suit.Clubs),
      createCard('A', Suit.Hearts),
      createCard('K', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Straight Flush');
  });

  it('should correctly identify Four of a Kind', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)];
    const communityCards: Card[] = [
      createCard('A', Suit.Clubs),
      createCard('A', Suit.Diamonds),
      createCard('K', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Four of a Kind');
  });

  it('should correctly identify a Full House', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)];
    const communityCards: Card[] = [
      createCard('A', Suit.Clubs),
      createCard('K', Suit.Diamonds),
      createCard('K', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Full House');
  });

  it('should correctly identify a Flush', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('K', Suit.Spades)];
    const communityCards: Card[] = [
      createCard('7', Suit.Spades),
      createCard('3', Suit.Spades),
      createCard('2', Suit.Spades),
      createCard('Q', Suit.Hearts),
      createCard('J', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Flush');
  });

  it('should correctly identify a Straight', () => {
    const holeCards: [Card, Card] = [createCard('5', Suit.Clubs), createCard('4', Suit.Diamonds)];
    const communityCards: Card[] = [
      createCard('3', Suit.Hearts),
      createCard('2', Suit.Spades),
      createCard('A', Suit.Clubs),
      createCard('K', Suit.Hearts),
      createCard('Q', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Straight');
  });

  it('should correctly identify Three of a Kind', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)];
    const communityCards: Card[] = [
      createCard('A', Suit.Clubs),
      createCard('K', Suit.Diamonds),
      createCard('Q', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Three of a Kind');
  });

  it('should correctly identify Two Pair', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)];
    const communityCards: Card[] = [
      createCard('K', Suit.Clubs),
      createCard('K', Suit.Diamonds),
      createCard('Q', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Two Pair');
  });

  it('should correctly identify One Pair', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)];
    const communityCards: Card[] = [
      createCard('K', Suit.Clubs),
      createCard('Q', Suit.Diamonds),
      createCard('J', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('Pair');
  });

  it('should correctly identify High Card', () => {
    const holeCards: [Card, Card] = [createCard('A', Suit.Spades), createCard('K', Suit.Hearts)];
    const communityCards: Card[] = [
      createCard('Q', Suit.Clubs),
      createCard('J', Suit.Diamonds),
      createCard('9', Suit.Spades),
      createCard('2', Suit.Hearts),
      createCard('3', Suit.Diamonds),
    ];
    const hand = evaluateHand(holeCards, communityCards);
    expect(hand.name).toBe('High Card');
  });
});

describe('determineWinner', () => {
  const communityCards: Card[] = [
    createCard('7', Suit.Spades),
    createCard('8', Suit.Hearts),
    createCard('9', Suit.Clubs),
    createCard('2', Suit.Diamonds),
    createCard('3', Suit.Spades),
  ];

  it('should determine a single winner', () => {
    const player1: Player = {
      id: 1, name: 'Player 1', avatarUrl: '', stack: 1000, status: PlayerStatus.Active, isEliminated: false,
      cards: [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)],
    };
    const player2: Player = {
      id: 2, name: 'Player 2', avatarUrl: '', stack: 1000, status: PlayerStatus.Active, isEliminated: false,
      cards: [createCard('K', Suit.Spades), createCard('K', Suit.Hearts)],
    };
    const players = [player1, player2];

    const winners = determineWinner(players, communityCards);
    expect(winners.length).toBe(1);
    expect(winners[0].id).toBe(player1.id);
  });

  it('should handle a split pot with two winners', () => {
    const player1: Player = {
      id: 1, name: 'Player 1', avatarUrl: '', stack: 1000, status: PlayerStatus.Active, isEliminated: false,
      cards: [createCard('A', Suit.Spades), createCard('K', Suit.Hearts)],
    };
    const player2: Player = {
      id: 2, name: 'Player 2', avatarUrl: '', stack: 1000, status: PlayerStatus.Active, isEliminated: false,
      cards: [createCard('A', Suit.Clubs), createCard('K', Suit.Diamonds)],
    };
    const players = [player1, player2];

    const communityCardsSplit: Card[] = [
      createCard('Q', Suit.Spades),
      createCard('J', Suit.Hearts),
      createCard('10', Suit.Clubs),
      createCard('2', Suit.Diamonds),
      createCard('3', Suit.Spades),
    ];

    const winners = determineWinner(players, communityCardsSplit);
    expect(winners.length).toBe(2);
    expect(winners.some(w => w.id === player1.id)).toBe(true);
    expect(winners.some(w => w.id === player2.id)).toBe(true);
  });

  it('should return an empty array if no active players', () => {
    const players: Player[] = [
      { id: 1, name: 'Player 1', avatarUrl: '', stack: 1000, status: PlayerStatus.Folded, isEliminated: false, cards: [createCard('A', Suit.Spades), createCard('K', Suit.Hearts)] },
      { id: 2, name: 'Player 2', avatarUrl: '', stack: 1000, status: PlayerStatus.Folded, isEliminated: false, cards: [createCard('Q', Suit.Spades), createCard('J', Suit.Hearts)] },
    ];
    const winners = determineWinner(players, communityCards);
    expect(winners.length).toBe(0);
  });

  it('should handle players with no cards (e.g., folded before showdown)', () => {
    const player1: Player = {
      id: 1, name: 'Player 1', avatarUrl: '', stack: 1000, status: PlayerStatus.Active, isEliminated: false,
      cards: [createCard('A', Suit.Spades), createCard('A', Suit.Hearts)],
    };
    const player2: Player = {
      id: 2, name: 'Player 2', avatarUrl: '', stack: 1000, status: PlayerStatus.Folded, isEliminated: false,
      cards: undefined,
    };
    const players = [player1, player2];

    const winners = determineWinner(players, communityCards);
    expect(winners.length).toBe(1);
    expect(winners[0].id).toBe(player1.id);
  });
});
