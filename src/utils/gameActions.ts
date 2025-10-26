import { GameState, Player, GamePhase, PlayerStatus, Card, SidePot } from '../types';
import { createDeck, shuffleDeck, dealCard } from './deck';
import { determineWinner, evaluateHand } from './handEvaluator';

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
  if (numPlayers === 0) return -1;
  // Normalize start index to [0, numPlayers)
  const normalizedStart = ((startIndex % numPlayers) + numPlayers) % numPlayers;
  for (let i = 0; i < numPlayers; i++) {
    const currentIndex = (normalizedStart + i) % numPlayers;
    const p = players[currentIndex];
    if (p && p.status === PlayerStatus.Active && !p.isEliminated) {
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
 * 3. If there was a raise, all other active players must have acted after that raise.
 * @param gameState The current game state.
 * @returns True if the betting round is over, false otherwise.
 */
export const isBettingRoundOver = (gameState: GameState): boolean => {
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

  // Check if all active players have matched the current bet or folded (or are all-in)
  for (const player of activePlayers) {
    const playerBetInRound = bettingState.actions
      .filter(action => action.playerId === player.id && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
      .reduce((sum, action) => sum + (action.amount || 0), 0);

    // If player hasn't matched the bet AND still has chips, they need to act
    if (playerBetInRound < currentBet && player.stack > 0) {
      return false; // This player still needs to act or match the bet
    }
  }

  // If there was a raise, check if all other active players have acted AFTER the raise
  if (lastRaiserIndex !== null && lastRaiserIndex !== undefined) {
    // Find the LAST raise action by the last raiser
    let raiseActionIndex = -1;
    for (let i = bettingState.actions.length - 1; i >= 0; i--) {
      if (bettingState.actions[i].playerId === players[lastRaiserIndex].id && 
          bettingState.actions[i].action === 'raise') {
        raiseActionIndex = i;
        break;
      }
    }
    
    // Special case: if raiseAction is -1, it means the "raise" was a blind post (preflop big blind)
    // In this case, all other players just need to have acted (matched the bet)
    if (raiseActionIndex === -1) {
      // Check if all other active players have acted at least once
      for (const player of activePlayers) {
        if (player.id === players[lastRaiserIndex].id) {
          continue; // Skip the big blind player
        }
        
        const playerActions = bettingState.actions.filter(
          action => action.playerId === player.id
        );
        
        if (playerActions.length === 0) {
          return false; // This player hasn't acted yet
        }
      }
      return true; // All non-blind players have acted, round is over
    }
    
    // Check if all other active players have acted after the last raise
    for (const player of activePlayers) {
      if (player.id === players[lastRaiserIndex].id) {
        continue; // Skip the raiser
      }
      
      // Find the last action by this player after the raise
      const playerActionsAfterRaise = bettingState.actions.slice(raiseActionIndex + 1).filter(
        action => action.playerId === player.id
      );
      
      // Player needs to act if they haven't acted after the raise AND they still have chips
      if (playerActionsAfterRaise.length === 0 && player.stack > 0) {
        return false; // This player hasn't acted after the raise
      }
    }
  }

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

  // Move turn to the NEXT active player after the current one
  let nextPlayerIndex = getNextActivePlayerIndex((newBettingState.currentPlayerIndex + 1) % newPlayers.length, newPlayers);

  // Calculate side pots for display
  const { sidePots } = calculateSidePots(newPlayers, newBettingState.actions);

  return {
    ...gameState,
    players: newPlayers,
    sidePots: sidePots.length > 0 ? sidePots : undefined,
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
  
  // Check if betting round is over after this call
  const tempState: GameState = {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    bettingState: newBettingState,
  };
  
  const roundOver = isBettingRoundOver(tempState);
  
  // Only move turn if round is not over
  let nextPlayerIndex = roundOver 
    ? newBettingState.currentPlayerIndex 
    : getNextActivePlayerIndex((newBettingState.currentPlayerIndex + 1) % newPlayers.length, newPlayers);

  // Calculate side pots for display
  const { sidePots } = calculateSidePots(newPlayers, newBettingState.actions);

  return {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    sidePots: sidePots.length > 0 ? sidePots : undefined,
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
 * @param raiseByAmount The amount to raise by (will be added to current bet to determine new bet level).
 * @returns The updated game state.
 */
export const raise = (gameState: GameState, playerId: number, raiseByAmount: number): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState; // Player not found

  const player = gameState.players[playerIndex];
  const currentBet = gameState.bettingState.currentBet;
  const playerBetInRound = gameState.bettingState.actions
    .filter(action => action.playerId === playerId && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0);

  // Calculate the new total bet amount
  const newBetAmount = currentBet + raiseByAmount;
  
  // Calculate how much the player needs to put in from their stack
  const amountToAdd = newBetAmount - playerBetInRound;

  if (amountToAdd > player.stack) {
    // Cannot bet more than player has
    return gameState; // Or throw an error
  }

  // Minimum raise must be at least big blind, UNLESS player is going all-in
  const isAllIn = amountToAdd === player.stack;
  if (!isAllIn && raiseByAmount < BIG_BLIND) {
    return gameState; // Or throw an error
  }

  const newPlayers = gameState.players.map((p, index) =>
    index === playerIndex ? { ...p, stack: p.stack - amountToAdd } : p
  );

  const newBettingState = { ...gameState.bettingState };
  newBettingState.actions.push({ playerId, action: 'raise', amount: amountToAdd });

  let newPot = gameState.pot + amountToAdd;
  // Move turn to the NEXT active player after the current one
  let nextPlayerIndex = getNextActivePlayerIndex((newBettingState.currentPlayerIndex + 1) % newPlayers.length, newPlayers);

  // Calculate side pots for display
  const { sidePots } = calculateSidePots(newPlayers, newBettingState.actions);

  return {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    sidePots: sidePots.length > 0 ? sidePots : undefined,
    bettingState: {
      ...newBettingState,
      currentBet: newBetAmount, // Set current bet to the new total bet amount
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

  // Check if betting round is over after this check
  const tempState: GameState = {
    ...gameState,
    bettingState: newBettingState,
  };
  
  const roundOver = isBettingRoundOver(tempState);
  
  // Only move turn if round is not over
  let nextPlayerIndex = roundOver 
    ? newBettingState.currentPlayerIndex 
    : getNextActivePlayerIndex((newBettingState.currentPlayerIndex + 1) % gameState.players.length, gameState.players);

  // Calculate side pots for display
  const { sidePots } = calculateSidePots(gameState.players, newBettingState.actions);

  return {
    ...gameState,
    sidePots: sidePots.length > 0 ? sidePots : undefined,
    bettingState: {
      ...newBettingState,
      currentPlayerIndex: nextPlayerIndex,
    },
  };
};

/**
 * Calculate side pots based on player contributions and all-in amounts.
 * Returns an array of side pots with eligible players for each pot.
 * This function is used both during the hand (for display) and at showdown (for awarding).
 * @param players The array of players in the hand
 * @param bettingActions The betting actions from the current hand
 * @returns Array of side pots with amounts and eligible player IDs
 */
export const calculateSidePots = (
  players: Player[],
  bettingActions: { playerId: number; action: string; amount?: number }[]
): { mainPot: number; sidePots: SidePot[] } => {
  // Calculate total contribution for each player across all betting rounds
  const contributions = new Map<number, number>();
  
  players.forEach(player => {
    const totalContribution = bettingActions
      .filter(a => a.playerId === player.id)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    contributions.set(player.id, totalContribution);
  });
  
  // Get active players (not folded, not eliminated, and contributed to pot)
  const activePlayers = players.filter(p => 
    p.status === PlayerStatus.Active && 
    !p.isEliminated &&
    (contributions.get(p.id) || 0) > 0
  );
  
  // If no side pots needed (no all-ins or only one player), return simple main pot
  if (activePlayers.length <= 1) {
    const totalPot = Array.from(contributions.values()).reduce((sum, val) => sum + val, 0);
    return { mainPot: totalPot, sidePots: [] };
  }
  
  // Check if there are different contribution amounts among active players
  // Side pots only exist when players are all-in for different amounts
  const activeContributions = activePlayers.map(p => contributions.get(p.id) || 0);
  const uniqueContributions = new Set(activeContributions);
  
  // If all active players contributed the same amount, no side pots needed
  if (uniqueContributions.size === 1) {
    const totalPot = Array.from(contributions.values()).reduce((sum, val) => sum + val, 0);
    return { mainPot: totalPot, sidePots: [] };
  }
  
  // Check if any active player is actually all-in (stack = 0)
  // Side pots only make sense if someone went all-in for less than others
  const hasAllInPlayer = activePlayers.some(p => p.stack === 0);
  if (!hasAllInPlayer) {
    // No one is all-in, so no side pots even if contributions differ
    const totalPot = Array.from(contributions.values()).reduce((sum, val) => sum + val, 0);
    return { mainPot: totalPot, sidePots: [] };
  }
  
  // Sort players by their contribution amount (ascending)
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    const aContrib = contributions.get(a.id) || 0;
    const bContrib = contributions.get(b.id) || 0;
    return aContrib - bContrib;
  });
  
  const pots: SidePot[] = [];
  let remainingContributions = new Map(contributions);
  
  // Build pots from smallest to largest contribution among active players
  for (let i = 0; i < sortedPlayers.length; i++) {
    const currentPlayer = sortedPlayers[i];
    const capAmount = contributions.get(currentPlayer.id) || 0;
    
    // Skip if this player has no remaining contribution
    if (capAmount === 0) continue;
    
    // Calculate pot at this level
    let potAmount = 0;
    const eligiblePlayerIds: number[] = [];
    
    // Each player (including folded ones) contributes up to the cap amount
    // But only active players are eligible to win
    for (const [playerId, remaining] of remainingContributions.entries()) {
      if (remaining > 0) {
        const contribution = Math.min(remaining, capAmount);
        potAmount += contribution;
        remainingContributions.set(playerId, remaining - contribution);
        
        // Player is eligible to WIN if they're still active (not folded)
        const player = players.find(p => p.id === playerId);
        if (player && player.status === PlayerStatus.Active && !player.isEliminated) {
          if (!eligiblePlayerIds.includes(playerId)) {
            eligiblePlayerIds.push(playerId);
          }
        }
      }
    }
    
    // Add pot if it has chips and there are eligible winners
    if (potAmount > 0 && eligiblePlayerIds.length > 0) {
      pots.push({ amount: potAmount, eligiblePlayerIds });
    }
  }
  
  // The first pot is the main pot, rest are side pots
  const mainPot = pots.length > 0 ? pots[0].amount : 0;
  const sidePots = pots.slice(1);
  
  return { mainPot, sidePots };
};

/**
 * Ends the current hand, determines winner(s), awards the pot, and updates chip counts.
 * Handles side pots when players are all-in for different amounts.
 * @param gameState The current game state.
 * @returns The updated game state.
 */
export const endHand = (gameState: GameState): GameState => {
  let newPlayers = [...gameState.players];
  let newPot = gameState.pot;

  // Don't mark players as eliminated yet - wait until after pot is awarded
  const activePlayersInShowdown = newPlayers.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);

  if (activePlayersInShowdown.length === 1) {
    // Only one player left, they win the pot without showdown
    const winner = activePlayersInShowdown[0];
    winner.stack += newPot;
    newPot = 0;
    
    // NOW mark players with 0 chips as eliminated (after pot is awarded)
    newPlayers.forEach(player => {
      if (player.stack <= 0) {
        player.isEliminated = true;
        player.status = PlayerStatus.Folded; // Eliminated players are effectively folded
      }
    });
    
    return {
      ...gameState,
      players: newPlayers,
      pot: newPot,
      sidePots: [], // Clear side pots
      gamePhase: GamePhase.HAND_COMPLETE,
      winningHandType: undefined, // No showdown, so no winning hand type
      lastWinner: winner.name,
      lastWinningHandType: undefined, // No showdown, so no winning hand type
    };
  }

  // If no community cards and no showdown needed (shouldn't happen normally, but handle it)
  if (gameState.communityCards.length === 0 && activePlayersInShowdown.length > 1) {
    // Award pot to first active player (fallback)
    const winner = activePlayersInShowdown[0];
    winner.stack += newPot;
    newPot = 0;
    
    newPlayers.forEach(player => {
      if (player.stack <= 0) {
        player.isEliminated = true;
        player.status = PlayerStatus.Folded;
      }
    });
    
    return {
      ...gameState,
      players: newPlayers,
      pot: newPot,
      sidePots: [], // Clear side pots
      gamePhase: GamePhase.HAND_COMPLETE,
      winningHandType: undefined,
      lastWinner: winner.name,
      lastWinningHandType: undefined,
    };
  }

  // Calculate side pots based on betting actions
  const { mainPot, sidePots } = calculateSidePots(newPlayers, gameState.bettingState.actions);
  
  // Award main pot and side pots
  let winningHandType: string | undefined;
  let lastWinner: string | undefined;
  
  // If there are side pots, use the calculated pot distribution
  if (sidePots.length > 0) {
    // Award main pot
    if (mainPot > 0) {
      const mainPotEligiblePlayers = newPlayers.filter(p => 
        p.status === PlayerStatus.Active && !p.isEliminated
      );
      
      const mainPotWinners = determineWinner(mainPotEligiblePlayers, gameState.communityCards);
      if (mainPotWinners.length > 0) {
        const potShare = mainPot / mainPotWinners.length;
        mainPotWinners.forEach(winner => {
          const playerToUpdate = newPlayers.find(p => p.id === winner.id);
          if (playerToUpdate) {
            playerToUpdate.stack += potShare;
          }
        });
        
        // Store winning hand info from main pot winner
        const firstWinner = mainPotWinners[0];
        lastWinner = firstWinner.name;
        if (firstWinner.cards) {
          const evaluatedHand = evaluateHand(firstWinner.cards, gameState.communityCards);
          winningHandType = evaluatedHand.name;
        }
      }
    }
    
    // Award each side pot
    sidePots.forEach(sidePot => {
      const eligiblePlayers = newPlayers.filter(p => 
        sidePot.eligiblePlayerIds.includes(p.id) &&
        p.status === PlayerStatus.Active && 
        !p.isEliminated
      );
      
      if (eligiblePlayers.length > 0) {
        const sidePotWinners = determineWinner(eligiblePlayers, gameState.communityCards);
        if (sidePotWinners.length > 0) {
          const potShare = sidePot.amount / sidePotWinners.length;
          sidePotWinners.forEach(winner => {
            const playerToUpdate = newPlayers.find(p => p.id === winner.id);
            if (playerToUpdate) {
              playerToUpdate.stack += potShare;
            }
          });
        }
      }
    });
  } else {
    // No side pots - simple pot award using gameState.pot
    const winners = determineWinner(newPlayers, gameState.communityCards);
    if (winners.length > 0) {
      const potShare = newPot / winners.length;
      winners.forEach(winner => {
        const playerToUpdate = newPlayers.find(p => p.id === winner.id);
        if (playerToUpdate) {
          playerToUpdate.stack += potShare;
        }
      });
      
      // Store winning hand info
      const firstWinner = winners[0];
      lastWinner = firstWinner.name;
      if (firstWinner.cards) {
        const evaluatedHand = evaluateHand(firstWinner.cards, gameState.communityCards);
        winningHandType = evaluatedHand.name;
      }
    }
  }
  
  newPot = 0;

  // Reveal all cards for active players
  newPlayers.forEach(player => {
    if (player.status === PlayerStatus.Active && !player.isEliminated && !player.cards) {
      // This case should ideally not happen if cards are dealt correctly
      // but as a fallback, ensure cards are visible if they somehow aren't
      // For AI, their cards are usually hidden until showdown
      // Here we assume cards are already set for active players in showdown
    }
  });

  // Mark players with 0 chips as eliminated (after pot is awarded)
  newPlayers.forEach(player => {
    if (player.stack <= 0) {
      player.isEliminated = true;
      player.status = PlayerStatus.Folded; // Eliminated players are effectively folded
    }
  });

  return {
    ...gameState,
    players: newPlayers,
    pot: newPot,
    sidePots: [], // Clear side pots after awarding
    gamePhase: GamePhase.HAND_COMPLETE,
    winningHandType: winningHandType, // Store the winning hand type
    lastWinner: lastWinner,
    lastWinningHandType: winningHandType,
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
      // After river betting is complete, go directly to hand complete (showdown)
      return endHand(gameState);
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
  // Fallback: if none found, try from index 0
  if (firstPlayerToActIndex === -1) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].status === PlayerStatus.Active && !players[i].isEliminated) {
        firstPlayerToActIndex = i;
        break;
      }
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

  // Find first player to act (UTG) — the first active player after big blind
  currentIndex = bigBlindIndex;
  for (let i = 0; i < newPlayers.length; i++) {
    currentIndex = (currentIndex + 1) % newPlayers.length;
    if (!newPlayers[currentIndex].isEliminated) {
      firstPlayerToActIndex = currentIndex;
      break;
    }
  }

  // 2. Post blinds and record actions
  const blindActions: Array<{ playerId: number; action: 'bet' | 'raise' | 'call' | 'check' | 'fold'; amount?: number }> = [];
  
  if (smallBlindIndex !== -1) {
    const sbPlayer = newPlayers[smallBlindIndex];
    const sbAmount = Math.min(SMALL_BLIND, sbPlayer.stack);
    sbPlayer.stack -= sbAmount;
    newPot += sbAmount;
    blindActions.push({ playerId: sbPlayer.id, action: 'bet', amount: sbAmount });
  }
  if (bigBlindIndex !== -1) {
    const bbPlayer = newPlayers[bigBlindIndex];
    const bbAmount = Math.min(BIG_BLIND, bbPlayer.stack);
    bbPlayer.stack -= bbAmount;
    newPot += bbAmount;
    blindActions.push({ playerId: bbPlayer.id, action: 'raise', amount: bbAmount });
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
      currentPlayerIndex: firstPlayerToActIndex === -1 ? 0 : firstPlayerToActIndex,
      currentBet: BIG_BLIND,
      lastRaiserIndex: bigBlindIndex,
      actions: blindActions, // Include blind posts in actions
    },
    dealerIndex: newDealerIndex,
  };
};