import { GameState, Player, GamePhase, PlayerStatus, Card } from '../types';
import { createDeck, shuffleDeck, dealCard } from './deck';
import { determineWinner } from './handEvaluator';

export const SMALL_BLIND = 25;
export const BIG_BLIND = 50;

/**
 * Finds the index of the next active player in a clockwise direction.
 * Skips players who are folded or eliminated.
 * @param startIndex The index to start searching from.
 * @param players The array of players.
 * @returns The index of the next active player, or -1 if no active players are found.
 */
const getNextActivePlayerIndex = (startIndex: number, players: Player[]): number => {
  const numPlayers = players.length;
  for (let i = 0; i < numPlayers; i++) {
    const currentIndex = (startIndex + i) % numPlayers;
    if (players[currentIndex].status === PlayerStatus.Active && !players[currentIndex].isEliminated) {
      return currentIndex;
    }
  }
  return -1; // No active players found
};

/**
 * Checks if the current betting round is over.
 * A betting round is over if:
 * 1. All active players have either folded or matched the current bet.
 * 2. At least one bet has been made (unless all players checked).
 * @param gameState The current game state.
 * @returns True if the betting round is over, false otherwise.
 */
const isBettingRoundOver = (gameState: GameState): boolean => {
  const { players, bettingState } = gameState;
  const { currentBet, lastRaiserIndex } = bettingState;

  const activePlayers = players.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);

  if (activePlayers.length <= 1) {
    return true; // Only one or zero active players left, round is over
  }

  // If no one has bet yet (currentBet is 0) and all active players have acted, it's a check round
  if (currentBet === 0) {
    const allActivePlayersActed = activePlayers.every(player =>
      bettingState.actions.some(action => action.playerId === player.id)
    );
    return allActivePlayersActed;
  }

  // Check if all active players have matched the current bet or folded
  for (const player of activePlayers) {
    const playerBetInRound = bettingState.actions
      .filter(action => action.playerId === player.id && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
      .reduce((sum, action) => sum + (action.amount || 0), 0);

    if (playerBetInRound < currentBet) {
      return false; // This player still needs to act or match the bet
    }
  }

  // If the last raiser has been reached and all active players have matched or folded
  // This logic needs to be more robust for multiple raises
  // For now, a simple check if all active players have matched the current bet
  return true;
};

/**
 * Handles a player folding.
 * @param gameState The current game state.
 * @param playerId The ID of the player folding.
 * @returns The updated game state.
 */
export const fold = (gameState: GameState, playerId: number): GameState => {
  const newPlayers = gameState.players.map(player =>
    player.id === playerId ? { ...player, status: PlayerStatus.Folded } : player
  );

  const newBettingState = { ...gameState.bettingState };
  newBettingState.actions.push({ playerId, action: 'fold' });

  let nextPlayerIndex = getNextActivePlayerIndex(newBettingState.currentPlayerIndex, newPlayers);

  return {
    ...gameState,
    players: newPlayers,
    bettingState: {
      ...newBettingState,
      currentPlayerIndex: nextPlayerIndex,
    },
  };
};

/**
 * Handles a player calling the current bet.
 * @param gameState The current game state.
 * @param playerId The ID of the player calling.
 * @returns The updated game state.
 */
export const call = (gameState: GameState, playerId: number): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState; // Player not found

  const player = gameState.players[playerIndex];
  const amountToCall = gameState.bettingState.currentBet - (gameState.bettingState.actions
    .filter(action => action.playerId === playerId && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0));

  if (amountToCall <= 0) {
    // Player has already matched or exceeded the current bet, should be a check or raise
    return gameState; // Or throw an error
  }

  const callAmount = Math.min(amountToCall, player.stack);

  const newPlayers = gameState.players.map((p, index) =>
    index === playerIndex ? { ...p, stack: p.stack - callAmount } : p
  );

  const newBettingState = { ...gameState.bettingState };
  newBettingState.actions.push({ playerId, action: 'call', amount: callAmount });

  let newPot = gameState.pot + callAmount;
  let nextPlayerIndex = getNextActivePlayerIndex(newBettingState.currentPlayerIndex, newPlayers);

  return {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    bettingState: {
      ...newBettingState,
      currentPlayerIndex: nextPlayerIndex,
    },
  };
};

/**
 * Handles a player raising the current bet.
 * @param gameState The current game state.
 * @param playerId The ID of the player raising.
 * @param raiseAmount The amount the player is raising to (total bet).
 * @returns The updated game state.
 */
export const raise = (gameState: GameState, playerId: number, raiseAmount: number): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState; // Player not found

  const player = gameState.players[playerIndex];
  const currentBet = gameState.bettingState.currentBet;
  const playerBetInRound = gameState.bettingState.actions
    .filter(action => action.playerId === playerId && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0);

  const amountToCall = currentBet - playerBetInRound;
  const totalBet = amountToCall + raiseAmount; // raiseAmount is the amount *added* to the current bet

  if (totalBet > player.stack) {
    // Cannot bet more than player has
    return gameState; // Or throw an error
  }

  if (raiseAmount < BIG_BLIND && currentBet !== 0) {
    // Minimum raise is the big blind, unless it's the first bet
    return gameState; // Or throw an error
  }

  const newPlayers = gameState.players.map((p, index) =>
    index === playerIndex ? { ...p, stack: p.stack - totalBet } : p
  );

  const newBettingState = { ...gameState.bettingState };
  newBettingState.actions.push({ playerId, action: 'raise', amount: totalBet });

  let newPot = gameState.pot + totalBet;
  let nextPlayerIndex = getNextActivePlayerIndex(newBettingState.currentPlayerIndex, newPlayers);

  return {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    bettingState: {
      ...newBettingState,
      currentBet: currentBet + raiseAmount, // Update current bet to the new raised amount
      lastRaiserIndex: playerIndex,
      currentPlayerIndex: nextPlayerIndex,
    },
  };
};

/**
 * Handles a player checking.
 * @param gameState The current game state.
 * @param playerId The ID of the player checking.
 * @returns The updated game state.
 */
export const check = (gameState: GameState, playerId: number): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState; // Player not found

  // Player can only check if current bet is 0
  if (gameState.bettingState.currentBet !== 0) {
    return gameState; // Or throw an error
  }

  const newBettingState = { ...gameState.bettingState };
  newBettingState.actions.push({ playerId, action: 'check' });

  let nextPlayerIndex = getNextActivePlayerIndex(newBettingState.currentPlayerIndex, gameState.players);

  return {
    ...gameState,
    bettingState: {
      ...newBettingState,
      currentPlayerIndex: nextPlayerIndex,
    },
  };
};

/**
 * Ends the current hand, determines winner(s), awards the pot, and updates chip counts.
 * @param gameState The current game state.
 * @returns The updated game state.
 */
export const endHand = (gameState: GameState): GameState => {
  let newPlayers = [...gameState.players];
  let newPot = gameState.pot;

  // Mark players with 0 chips as eliminated
  newPlayers.forEach(player => {
    if (player.stack <= 0) {
      player.isEliminated = true;
      player.status = PlayerStatus.Folded; // Eliminated players are effectively folded
    }
  });

  const activePlayersInShowdown = newPlayers.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);

  if (activePlayersInShowdown.length === 1) {
    // Only one player left, they win the pot without showdown
    const winner = activePlayersInShowdown[0];
    winner.stack += newPot;
    newPot = 0;
    return {
      ...gameState,
      players: newPlayers,
      pot: newPot,
      gamePhase: GamePhase.HAND_COMPLETE,
    };
  }

  // Showdown: evaluate hands and determine winner(s)
  const winners = determineWinner(newPlayers, gameState.communityCards);

  let winningHandType: string | undefined;
  if (winners.length > 0) {
    const potShare = newPot / winners.length;
    winners.forEach(winner => {
      const playerToUpdate = newPlayers.find(p => p.id === winner.id);
      if (playerToUpdate) {
        playerToUpdate.stack += potShare;
      }
    });
    newPot = 0;

    // Get the winning hand type from the first winner (assuming all winners have the same hand type in a tie)
    const firstWinner = winners[0];
    if (firstWinner.cards) {
      const evaluatedHand = evaluateHand(firstWinner.cards, gameState.communityCards);
      winningHandType = evaluatedHand.name;
    }
  }

  // Reveal all cards for active players
  newPlayers.forEach(player => {
    if (player.status === PlayerStatus.Active && !player.isEliminated && !player.cards) {
      // This case should ideally not happen if cards are dealt correctly
      // but as a fallback, ensure cards are visible if they somehow aren't
      // For AI, their cards are usually hidden until showdown
      // Here we assume cards are already set for active players in showdown
    }
  });

  return {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    gamePhase: GamePhase.HAND_COMPLETE,
    winningHandType: winningHandType, // Store the winning hand type
  };
};

/**
 * Progresses the game to the next phase (Flop, Turn, River, Showdown).
 * Deals community cards and resets betting state for the new phase.
 * @param gameState The current game state.
 * @returns The updated game state.
 */
export const progressGamePhase = (gameState: GameState): GameState => {
  let { gamePhase, deck, communityCards, players, dealerIndex } = gameState;
  let newDeck = [...deck];
  let newCommunityCards = [...communityCards];
  let newGamePhase = gamePhase;

  // Check if only one player remains active in the hand
  const activePlayersCount = players.filter(p => p.status === PlayerStatus.Active && !p.isEliminated).length;
  if (activePlayersCount <= 1) {
    return endHand(gameState); // End hand immediately if only one player is left
  }

  // Reset betting state for the new round
  const newBettingState = {
    currentPlayerIndex: -1, // Will be determined below
    currentBet: 0,
    lastRaiserIndex: null,
    actions: [],
  };

  switch (gamePhase) {
    case GamePhase.PREFLOP:
      // Deal Flop (3 cards)
      for (let i = 0; i < 3; i++) {
        const { card, newDeck: updatedDeck } = dealCard(newDeck);
        newCommunityCards.push(card);
        newDeck = updatedDeck;
      }
      newGamePhase = GamePhase.FLOP;
      break;
    case GamePhase.FLOP:
      // Deal Turn (1 card)
      const { card: turnCard, newDeck: updatedTurnDeck } = dealCard(newDeck);
      newCommunityCards.push(turnCard);
      newDeck = updatedTurnDeck;
      newGamePhase = GamePhase.TURN;
      break;
    case GamePhase.TURN:
      // Deal River (1 card)
      const { card: riverCard, newDeck: updatedRiverDeck } = dealCard(newDeck);
      newCommunityCards.push(riverCard);
      newDeck = updatedRiverDeck;
      newGamePhase = GamePhase.RIVER;
      break;
    case GamePhase.RIVER:
      newGamePhase = GamePhase.SHOWDOWN;
      break;
    case GamePhase.SHOWDOWN:
      return endHand(gameState); // End hand after showdown
    default:
      // Should not happen, or handle other phases like HAND_COMPLETE
      return gameState;
  }

  // Determine first player to act for the new betting round (first active player after dealer)
  let firstPlayerToActIndex = -1;
  let currentIndex = dealerIndex;
  for (let i = 0; i < players.length; i++) {
    currentIndex = (currentIndex + 1) % players.length;
    if (players[currentIndex].status === PlayerStatus.Active && !players[currentIndex].isEliminated) {
      firstPlayerToActIndex = currentIndex;
      break;
    }
  }
  newBettingState.currentPlayerIndex = firstPlayerToActIndex;

  return {
    ...gameState,
    deck: newDeck,
    communityCards: newCommunityCards,
    gamePhase: newGamePhase,
    bettingState: newBettingState,
  };
};

/**
 * Starts a new hand of poker, resetting the game state and dealing cards.
 * @param currentGameState The current state of the game.
 * @returns The new game state after initializing a hand.
 */
export const startNewHand = (currentGameState: GameState): GameState => {
  let newDeck = shuffleDeck(createDeck());
  let newPlayers = [...currentGameState.players];
  let newPot = 0;

  // Mark players with 0 chips as eliminated
  newPlayers.forEach(player => {
    if (player.stack <= 0) {
      player.isEliminated = true;
    }
  });

  // Add new AI players if fewer than 4 players remain (excluding the human player)
  const humanPlayer = newPlayers.find(p => p.isYou);
  const aiPlayers = newPlayers.filter(p => !p.isYou && !p.isEliminated);
  const eliminatedPlayers = newPlayers.filter(p => p.isEliminated);

  if (humanPlayer && aiPlayers.length < 8) { // 1 human + 8 AI = 9 players total
    const playersToAdd = 8 - aiPlayers.length;
    for (let i = 0; i < playersToAdd; i++) {
      const newPlayerId = Math.max(...newPlayers.map(p => p.id)) + 1;
      newPlayers.push({
        id: newPlayerId,
        name: `Player ${newPlayerId}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${newPlayerId}`,
        stack: 2500,
        status: PlayerStatus.Active,
        isEliminated: false,
      });
    }
  }

  // 1. Move dealer button (clockwise)
  let newDealerIndex = (currentGameState.dealerIndex + 1) % newPlayers.length;
  // Skip eliminated players for dealer button
  while (newPlayers[newDealerIndex].isEliminated) {
    newDealerIndex = (newDealerIndex + 1) % newPlayers.length;
  }

  // Reset player status and cards, mark eliminated players
  newPlayers.forEach(player => {
    player.cards = undefined;
    if (!player.isEliminated) {
      player.status = PlayerStatus.Active;
    }
    // Reset player bets for the new hand
    // This will be updated by posting blinds
  });

  // Determine small blind, big blind, and first player to act
  let smallBlindIndex = -1;
  let bigBlindIndex = -1;
  let firstPlayerToActIndex = -1;

  // Find small blind
  let currentIndex = newDealerIndex;
  for (let i = 0; i < newPlayers.length; i++) {
    currentIndex = (currentIndex + 1) % newPlayers.length;
    if (!newPlayers[currentIndex].isEliminated) {
      smallBlindIndex = currentIndex;
      break;
    }
  }

  // Find big blind
  currentIndex = smallBlindIndex;
  for (let i = 0; i < newPlayers.length; i++) {
    currentIndex = (currentIndex + 1) % newPlayers.length;
    if (!newPlayers[currentIndex].isEliminated) {
      bigBlindIndex = currentIndex;
      break;
    }
  }

  // Find first player to act (after big blind)
  currentIndex = bigBlindIndex;
  for (let i = 0; i < newPlayers.length; i++) {
    currentIndex = (currentIndex + 1) % newPlayers.length;
    if (!newPlayers[currentIndex].isEliminated) {
      firstPlayerToActIndex = currentIndex;
      break;
    }
  }

  // 2. Post blinds
  if (smallBlindIndex !== -1) {
    const sbPlayer = newPlayers[smallBlindIndex];
    const sbAmount = Math.min(SMALL_BLIND, sbPlayer.stack);
    sbPlayer.stack -= sbAmount;
    newPot += sbAmount;
    // Record blind action
    currentGameState.bettingState.actions.push({ playerId: sbPlayer.id, action: 'bet', amount: sbAmount });
  }
  if (bigBlindIndex !== -1) {
    const bbPlayer = newPlayers[bigBlindIndex];
    const bbAmount = Math.min(BIG_BLIND, bbPlayer.stack);
    bbPlayer.stack -= bbAmount;
    newPot += bbAmount;
    // Record blind action
    currentGameState.bettingState.actions.push({ playerId: bbPlayer.id, action: 'bet', amount: bbAmount });
  }

  // 3. Deal 2 cards to each active player
  for (let i = 0; i < newPlayers.length; i++) {
    if (!newPlayers[i].isEliminated) {
      const card1Result = dealCard(newDeck);
      const card1 = card1Result.card;
      newDeck = card1Result.newDeck;

      const card2Result = dealCard(newDeck);
      const card2 = card2Result.card;
      newDeck = card2Result.newDeck;

      newPlayers[i].cards = [card1, card2];
    }
  }

  return {
    ...currentGameState,
    players: newPlayers,
    deck: newDeck,
    communityCards: [],
    pot: newPot,
    gamePhase: GamePhase.PREFLOP,
    bettingState: {
      currentPlayerIndex: firstPlayerToActIndex,
      currentBet: BIG_BLIND,
      lastRaiserIndex: bigBlindIndex,
      actions: [], // Reset actions for the new betting round
    },
    dealerIndex: newDealerIndex,
  };
};