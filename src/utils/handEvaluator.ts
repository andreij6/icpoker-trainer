import { Hand } from 'pokersolver';
import { Card, Player } from '../types';

/**
 * Converts a Card object to a string format compatible with pokersolver.
 * @param card The card object to convert.
 * @returns A string representation of the card (e.g., "As", "Kh").
 */
const cardToString = (card: Card): string => {
  let rank = card.rank;
  if (rank === '10') rank = 'T';
  let suit = card.suit.charAt(0).toLowerCase();
  return `${rank}${suit}`;
};

/**
 * Checks if a straight flush is actually a Royal Flush (A-K-Q-J-10 of the same suit).
 * @param hand The evaluated hand from pokersolver.
 * @param cards The cards used in the hand.
 * @returns True if the hand is a Royal Flush.
 */
const isRoyalFlush = (hand: any, cards: Card[]): boolean => {
  // Must be a straight flush first
  if (hand.name !== 'Straight Flush') {
    return false;
  }
  
  // Check if the hand contains A, K, Q, J, 10 of the same suit
  const royalRanks = new Set(['A', 'K', 'Q', 'J', '10']);
  const suits = new Map<string, Set<string>>();
  
  // Group cards by suit
  for (const card of cards) {
    if (!suits.has(card.suit)) {
      suits.set(card.suit, new Set());
    }
    suits.get(card.suit)!.add(card.rank);
  }
  
  // Check if any suit has all royal ranks
  for (const [_, ranks] of suits) {
    if (ranks.size >= 5) {
      let hasAllRoyalRanks = true;
      for (const royalRank of royalRanks) {
        if (!ranks.has(royalRank)) {
          hasAllRoyalRanks = false;
          break;
        }
      }
      if (hasAllRoyalRanks) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Evaluates a player's hand given their hole cards and community cards.
 * @param holeCards The two hole cards of the player.
 * @param communityCards The community cards on the table.
 * @returns The evaluated hand from pokersolver, with custom Royal Flush detection.
 */
export const evaluateHand = (holeCards: [Card, Card], communityCards: Card[]) => {
  const allCards = [...holeCards, ...communityCards];
  const solverCards = allCards.map(cardToString);
  const hand = Hand.solve(solverCards);
  
  // Custom Royal Flush detection
  if (isRoyalFlush(hand, allCards)) {
    return {
      ...hand,
      name: 'Royal Flush',
      description: 'Royal Flush',
    };
  }
  
  return hand;
};

/**
 * Determines the winner(s) among a list of players.
 * @param players The list of players with their hole cards.
 * @param communityCards The community cards on the table.
 * @returns An array of winning players.
 */
export const determineWinner = (players: Player[], communityCards: Card[]): Player[] => {
  const activePlayers = players.filter(p => p.cards && p.cards.length === 2 && !p.isEliminated);

  if (activePlayers.length === 0) {
    return [];
  }

  const hands = activePlayers.map(player => ({
    player,
    hand: evaluateHand(player.cards!, communityCards),
  }));

  const winners = Hand.winners(hands.map(h => h.hand));

  // Map back to players
  const winningPlayers: Player[] = [];
  for (const winnerHand of winners) {
    const winningPlayer = hands.find(h => h.hand === winnerHand)?.player;
    if (winningPlayer) {
      winningPlayers.push(winningPlayer);
    }
  }

  return winningPlayers;
};
