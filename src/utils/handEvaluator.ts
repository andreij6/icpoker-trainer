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
 * Evaluates a player's hand given their hole cards and community cards.
 * @param holeCards The two hole cards of the player.
 * @param communityCards The community cards on the table.
 * @returns The evaluated hand from pokersolver.
 */
export const evaluateHand = (holeCards: [Card, Card], communityCards: Card[]) => {
  const allCards = [...holeCards, ...communityCards];
  const solverCards = allCards.map(cardToString);
  return Hand.solve(solverCards);
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
