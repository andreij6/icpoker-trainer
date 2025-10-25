import { Card, GameState, Player, GamePhase } from '../types';
import { evaluateHand } from './handEvaluator';
import { BIG_BLIND } from './gameActions';

export type HandTier = 'strong' | 'playable' | 'weak';
export type PostFlopStrength = 'monster' | 'strong' | 'medium' | 'weak' | 'trash';

const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Normalizes a rank to handle '10' vs 'T' representation.
 * @param rank The rank to normalize.
 * @returns The normalized rank string.
 */
const normalizeRank = (rank: string): string => {
  return rank === 'T' ? '10' : rank;
};

/**
 * Evaluates the strength of a two-card starting hand (preflop).
 * @param card1 The first card.
 * @param card2 The second card.
 * @returns 'strong', 'playable', or 'weak'.
 */
export const getHandTier = (card1: Card, card2: Card): HandTier => {
  const rank1 = RANK_ORDER.indexOf(normalizeRank(card1.rank));
  const rank2 = RANK_ORDER.indexOf(normalizeRank(card2.rank));
  const highRank = Math.max(rank1, rank2);
  const lowRank = Math.min(rank1, rank2);
  const isPair = card1.rank === card2.rank;
  const isSuited = card1.suit === card2.suit;
  const rankDiff = highRank - lowRank;

  // Strong hands: AA, KK, QQ, JJ, TT, AKs, AQs, KQs, AJs, KJs, AKo
  if (isPair && highRank >= RANK_ORDER.indexOf('10')) { // TT+
    return 'strong';
  }
  if (isSuited) {
    if (highRank === RANK_ORDER.indexOf('A') && lowRank >= RANK_ORDER.indexOf('J')) { // AJs+
      return 'strong';
    }
    if (highRank === RANK_ORDER.indexOf('K') && lowRank >= RANK_ORDER.indexOf('J')) { // KQs, KJs
      return 'strong';
    }
  }
  if (highRank === RANK_ORDER.indexOf('A') && lowRank === RANK_ORDER.indexOf('K')) { // AKo
    return 'strong';
  }

  // Playable hands: 99-22, Axs, suited connectors, broadway cards
  if (isPair) { // 22-99
    return 'playable';
  }
  if (isSuited) {
    if (highRank === RANK_ORDER.indexOf('A')) { // A2s-ATs
      return 'playable';
    }
    if (rankDiff === 1 || rankDiff === 2) { // Suited connectors and one-gappers
      return 'playable';
    }
    if (highRank >= RANK_ORDER.indexOf('10')) { // Other suited broadway
      return 'playable';
    }
  }

  // Offsuit broadway cards
  if (highRank >= RANK_ORDER.indexOf('Q') && lowRank >= RANK_ORDER.indexOf('10')) {
    return 'playable';
  }

  // Weak hands
  return 'weak';
};

/**
 * Evaluates post-flop hand strength considering made hands, draws, and potential.
 * @param holeCards The player's two hole cards.
 * @param communityCards The community cards on the table.
 * @returns A strength category: 'monster', 'strong', 'medium', 'weak', or 'trash'.
 */
export const evaluatePostFlopStrength = (
  holeCards: [Card, Card],
  communityCards: Card[]
): PostFlopStrength => {
  if (communityCards.length === 0) {
    // No community cards yet, fall back to preflop evaluation
    const tier = getHandTier(holeCards[0], holeCards[1]);
    if (tier === 'strong') return 'strong';
    if (tier === 'playable') return 'medium';
    return 'weak';
  }

  const hand = evaluateHand(holeCards, communityCards);
  const handRank = hand.rank;
  const handName = hand.name;

  // Pokersolver ranking: 1=High Card, 2=Pair, 3=Two Pair, 4=Three of a Kind, 
  // 5=Straight, 6=Flush, 7=Full House, 8=Four of a Kind, 9=Straight Flush
  // Higher rank = better hand

  // Monster hands: Straight Flush (9), Four of a Kind (8), Full House (7)
  if (handRank >= 7) {
    return 'monster';
  }

  // Strong hands: Flush (6), Straight (5), Three of a Kind (4)
  if (handRank >= 4) {
    return 'strong';
  }

  // Medium hands: Two Pair (3)
  if (handRank === 3) {
    return 'medium';
  }

  // One Pair (2) - evaluate pair strength
  if (handRank === 2) {
    const pairStrength = evaluatePairStrength(holeCards, communityCards, hand);
    return pairStrength;
  }

  // High card (1) - check if we have drawing potential
  if (handRank === 1) {
    const drawStrength = evaluateDrawingPotential(holeCards, communityCards);
    return drawStrength;
  }

  return 'trash';
};

/**
 * Evaluates the strength of a pair considering position and kicker.
 * @param holeCards The player's hole cards.
 * @param communityCards The community cards.
 * @param hand The evaluated hand from pokersolver.
 * @returns The strength of the pair.
 */
const evaluatePairStrength = (
  holeCards: [Card, Card],
  communityCards: Card[],
  hand: any
): PostFlopStrength => {
  // Check if it's a pocket pair
  const isPocketPair = holeCards[0].rank === holeCards[1].rank;
  
  // Get the pair rank value from pokersolver (converts 'K' to rank value)
  const pairRankStr = hand.cards[0].value === 'T' ? '10' : hand.cards[0].value;
  const pairRank = getRankValue(pairRankStr);
  
  // Check if we have top pair
  const communityRanks = communityCards.map(c => getRankValue(c.rank));
  const maxCommunityRank = Math.max(...communityRanks);
  
  if (isPocketPair) {
    // Pocket pairs are generally medium to strong
    if (pairRank >= getRankValue('J')) {
      return 'strong'; // JJ+ as a set or overpair
    }
    if (pairRank > maxCommunityRank) {
      return 'medium'; // Overpair
    }
    return 'weak'; // Underpair
  }
  
  // Top pair or better
  if (pairRank >= maxCommunityRank) {
    // Check kicker strength - hand.cards[2] is the first kicker (cards 0-1 are the pair)
    const kickers = hand.cards.slice(2);
    if (kickers.length > 0) {
      const kickerStr = kickers[0].value === 'T' ? '10' : kickers[0].value;
      const kickerRank = getRankValue(kickerStr);
      if (kickerRank >= getRankValue('J')) {
        return 'medium'; // Top pair with good kicker
      }
    }
    return 'weak'; // Top pair with weak kicker
  }
  
  // Middle or bottom pair
  return 'weak';
};

/**
 * Evaluates drawing potential when holding high cards.
 * @param holeCards The player's hole cards.
 * @param communityCards The community cards.
 * @returns The strength based on drawing potential.
 */
const evaluateDrawingPotential = (
  holeCards: [Card, Card],
  communityCards: Card[]
): PostFlopStrength => {
  // Check for flush draws
  const suitCounts: Record<string, number> = {};
  [...holeCards, ...communityCards].forEach(card => {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });
  
  const hasFlushDraw = Object.values(suitCounts).some(count => count === 4);
  
  // Check for straight draws (simplified)
  const allRanks = [...holeCards, ...communityCards].map(c => getRankValue(c.rank));
  const uniqueRanks = [...new Set(allRanks)].sort((a, b) => a - b);
  
  let hasStraightDraw = false;
  for (let i = 0; i < uniqueRanks.length - 2; i++) {
    const sequence = uniqueRanks.slice(i, i + 4);
    if (sequence.length === 4 && sequence[3] - sequence[0] <= 4) {
      hasStraightDraw = true;
      break;
    }
  }
  
  // High cards (A, K)
  const holeCardValues = holeCards.map(c => getRankValue(c.rank));
  const hasHighCards = holeCardValues.some(v => v >= getRankValue('K'));
  
  if (hasFlushDraw || hasStraightDraw) {
    return 'medium'; // Drawing hands have medium strength
  }
  
  if (hasHighCards) {
    return 'weak'; // Overcards have some potential
  }
  
  return 'trash'; // Nothing going on
};

/**
 * Gets the numeric value of a card rank for comparison.
 * @param rank The card rank.
 * @returns The numeric value (2-14).
 */
const getRankValue = (rank: string): number => {
  const normalized = normalizeRank(rank);
  const index = RANK_ORDER.indexOf(normalized);
  return index !== -1 ? index + 2 : 0;
};

// ============================================================================
// POSITION AWARENESS
// ============================================================================

export type Position = 'small_blind' | 'big_blind' | 'early' | 'middle' | 'late' | 'dealer';

/**
 * Determines a player's position relative to the dealer.
 * @param playerIndex The index of the player in the players array.
 * @param dealerIndex The index of the dealer.
 * @param totalPlayers The total number of active players at the table.
 * @returns The position of the player.
 */
export const getPosition = (
  playerIndex: number,
  dealerIndex: number,
  totalPlayers: number
): Position => {
  if (totalPlayers < 2) {
    return 'dealer'; // Edge case
  }

  // Calculate seats after dealer
  const seatsAfterDealer = (playerIndex - dealerIndex + totalPlayers) % totalPlayers;

  // For heads-up (2 players), dealer is small blind, other is big blind
  if (totalPlayers === 2) {
    return seatsAfterDealer === 0 ? 'small_blind' : 'big_blind';
  }

  // Small blind is 1 seat after dealer
  if (seatsAfterDealer === 1) {
    return 'small_blind';
  }

  // Big blind is 2 seats after dealer
  if (seatsAfterDealer === 2) {
    return 'big_blind';
  }

  // Dealer position
  if (seatsAfterDealer === 0) {
    return 'dealer';
  }

  // For 3-5 players, simplified positions
  if (totalPlayers <= 5) {
    // Last seat before dealer is late
    if (seatsAfterDealer === totalPlayers - 1) {
      return 'late';
    }
    // Everything else after blinds is middle
    return 'middle';
  }

  // For 6-9 players (standard), use position system based on table size
  // Early: first 2 seats after big blind (seats 3-4 after dealer)
  if (seatsAfterDealer === 3 || seatsAfterDealer === 4) {
    return 'early';
  }

  // For 6-7 player tables, seat 5 is late (cutoff region), seat 6+ is late
  // For 8-9 player tables, seats 5-6 are middle, 7+ are late
  if (totalPlayers >= 8) {
    // Middle: seats 5-6 after dealer for larger tables
    if (seatsAfterDealer === 5 || seatsAfterDealer === 6) {
      return 'middle';
    }
  }

  // Late: everything else before dealer
  // For 6-7 player tables: seats 5+ are late
  // For 8-9 player tables: seats 7+ are late
  return 'late';
};

/**
 * Determines if a position is favorable (late position has more information).
 * @param position The position to evaluate.
 * @returns true if the position is favorable (late position).
 */
export const isLatePosition = (position: Position): boolean => {
  return position === 'late' || position === 'dealer';
};

/**
 * Adjusts hand tier requirements based on position.
 * Early position requires stronger hands, late position can play more hands.
 * @param tier The base hand tier from preflop evaluation.
 * @param position The player's position.
 * @returns The adjusted hand tier for the given position.
 */
export const adjustTierForPosition = (tier: HandTier, position: Position): HandTier => {
  // Early position: upgrade requirements (only play strong hands, some playable become weak)
  if (position === 'early') {
    if (tier === 'playable') {
      // Downgrade marginal playable hands in early position
      return 'weak';
    }
    return tier;
  }

  // Middle position: standard play
  if (position === 'middle' || position === 'big_blind') {
    return tier;
  }

  // Late position: can loosen up slightly
  // This allows AI to play more hands from late position
  // In actual implementation, we'll keep the tier the same but adjust decision logic
  return tier;
};

// ============================================================================
// BET SIZING
// ============================================================================

/**
 * Calculates an appropriate bet size for the AI based on game situation.
 * @param strength The hand strength ('monster', 'strong', 'medium', 'weak', 'trash').
 * @param pot The current pot size.
 * @param playerStack The AI player's chip stack.
 * @param isBluff Whether this is a bluff bet.
 * @returns The bet amount.
 */
export const calculateBetSize = (
  strength: PostFlopStrength | 'strong_preflop',
  pot: number,
  playerStack: number,
  isBluff: boolean = false
): number => {
  let betPercentage: number;

  if (isBluff) {
    // Bluffs are moderate (40-50% pot)
    betPercentage = 0.40 + Math.random() * 0.10;
  } else {
    // Adjust bet size based on hand strength
    switch (strength) {
      case 'monster':
      case 'strong':
      case 'strong_preflop':
        // Value bets are larger (60-75% pot)
        betPercentage = 0.60 + Math.random() * 0.15;
        break;
      case 'medium':
        // Medium bets (50-60% pot)
        betPercentage = 0.50 + Math.random() * 0.10;
        break;
      case 'weak':
        // Smaller bets (40-50% pot)
        betPercentage = 0.40 + Math.random() * 0.10;
        break;
      default:
        betPercentage = 0.45;
    }
  }

  // Calculate bet with slight randomization (±20%)
  const randomization = 0.80 + Math.random() * 0.40; // 0.8 to 1.2
  let betAmount = Math.floor(pot * betPercentage * randomization);

  // Ensure minimum bet of big blind
  betAmount = Math.max(betAmount, BIG_BLIND);

  // Never bet more than player has
  betAmount = Math.min(betAmount, playerStack);

  return betAmount;
};

/**
 * Calculates preflop raise size based on position and hand strength.
 * @param handTier The hand tier ('strong', 'playable', 'weak').
 * @param position The player's position.
 * @param currentBet The current bet amount.
 * @param playerStack The AI player's chip stack.
 * @returns The raise amount.
 */
export const calculatePreflopRaiseSize = (
  handTier: HandTier,
  position: Position,
  currentBet: number,
  playerStack: number
): number => {
  let raiseMultiplier: number;

  if (handTier === 'strong') {
    // Strong hands raise 3x BB
    raiseMultiplier = 3.0;
  } else {
    // Playable hands from late position raise 2x BB
    raiseMultiplier = 2.0;
  }

  // Add slight randomization (±20%)
  const randomization = 0.80 + Math.random() * 0.40;
  let raiseAmount = Math.floor(BIG_BLIND * raiseMultiplier * randomization);

  // If there's already a bet, raise above it
  if (currentBet > 0) {
    raiseAmount = Math.max(raiseAmount, currentBet + BIG_BLIND);
  }

  // Never bet more than player has
  raiseAmount = Math.min(raiseAmount, playerStack);

  return raiseAmount;
};

// ============================================================================
// AI DECISION LOGIC
// ============================================================================

export type AIAction = {
  action: 'fold' | 'call' | 'raise' | 'check';
  amount?: number;
};

/**
 * Determines if the AI should make a decision with randomization for unpredictability.
 * @param baseProbability The base probability (0-1) of taking an action.
 * @returns true if the action should be taken.
 */
const randomizeDecision = (baseProbability: number): boolean => {
  return Math.random() < baseProbability;
};

/**
 * Makes a preflop AI decision based on hand strength, position, and betting action.
 * @param player The AI player making the decision.
 * @param gameState The current game state.
 * @param playerIndex The index of the AI player.
 * @returns The AI's decision (fold, call, raise, or check).
 */
export const makePreflopDecision = (
  player: Player,
  gameState: GameState,
  playerIndex: number
): AIAction => {
  if (!player.cards || player.cards.length !== 2) {
    return { action: 'fold' };
  }

  const [card1, card2] = player.cards;
  const handTier = getHandTier(card1, card2);
  
  // Determine position
  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const position = getPosition(playerIndex, gameState.dealerIndex, activePlayers.length);
  
  // Adjust hand tier for position
  const adjustedTier = adjustTierForPosition(handTier, position);
  
  const { currentBet, actions } = gameState.bettingState;
  const playerBetInRound = actions
    .filter(action => action.playerId === player.id && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0);
  
  const amountToCall = currentBet - playerBetInRound;
  const hasBeenRaised = actions.some(a => a.action === 'raise' && a.playerId !== player.id);
  
  // If no bet to call, can check
  if (amountToCall === 0) {
    // With strong hands, raise
    if (adjustedTier === 'strong' && randomizeDecision(0.85)) {
      const raiseAmount = calculatePreflopRaiseSize(handTier, position, currentBet, player.stack);
      return { action: 'raise', amount: raiseAmount };
    }
    
    // With playable hands from late position, sometimes raise
    if (adjustedTier === 'playable' && isLatePosition(position) && randomizeDecision(0.40)) {
      const raiseAmount = calculatePreflopRaiseSize('playable', position, currentBet, player.stack);
      return { action: 'raise', amount: raiseAmount };
    }
    
    // Otherwise check
    return { action: 'check' };
  }
  
  // Facing a bet
  // Strong hands: raise most of the time, sometimes call
  if (adjustedTier === 'strong') {
    if (hasBeenRaised) {
      // Re-raise with premium hands (AA, KK, QQ, AK)
      if (randomizeDecision(0.70)) {
        const raiseAmount = calculatePreflopRaiseSize(handTier, position, currentBet, player.stack);
        return { action: 'raise', amount: raiseAmount };
      }
      // Otherwise call
      return { action: 'call' };
    } else {
      // First raise, mostly raise
      if (randomizeDecision(0.80)) {
        const raiseAmount = calculatePreflopRaiseSize(handTier, position, currentBet, player.stack);
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: 'call' };
    }
  }
  
  // Playable hands: call from middle/late position, fold from early
  if (adjustedTier === 'playable') {
    if (hasBeenRaised) {
      // Fold to raises with marginal hands
      return { action: 'fold' };
    }
    
    // Call from late position
    if (isLatePosition(position) && randomizeDecision(0.70)) {
      return { action: 'call' };
    }
    
    // Sometimes call from middle position
    if (position === 'middle' && randomizeDecision(0.50)) {
      return { action: 'call' };
    }
    
    // Fold from early position
    return { action: 'fold' };
  }
  
  // Weak hands: fold
  return { action: 'fold' };
};

/**
 * Makes a post-flop AI decision based on hand strength, pot odds, and betting action.
 * @param player The AI player making the decision.
 * @param gameState The current game state.
 * @param playerIndex The index of the AI player.
 * @returns The AI's decision (fold, call, raise, or check).
 */
export const makePostFlopDecision = (
  player: Player,
  gameState: GameState,
  playerIndex: number
): AIAction => {
  if (!player.cards || player.cards.length !== 2) {
    return { action: 'fold' };
  }

  const [card1, card2] = player.cards;
  const { communityCards, pot, bettingState, gamePhase } = gameState;
  const { currentBet, actions } = bettingState;
  
  // Evaluate post-flop hand strength
  const handStrength = evaluatePostFlopStrength([card1, card2], communityCards);
  
  const playerBetInRound = actions
    .filter(action => action.playerId === player.id && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0);
  
  const amountToCall = currentBet - playerBetInRound;
  const hasBeenRaised = actions.some(a => (a.action === 'raise' || a.action === 'bet') && a.playerId !== player.id);
  
  // Calculate pot odds (simplified)
  const potOdds = amountToCall > 0 ? pot / amountToCall : Infinity;
  
  // Determine betting strategy based on hand strength
  if (amountToCall === 0) {
    // No bet to call, can check or bet
    
    // Monster hands: bet aggressively
    if (handStrength === 'monster') {
      const betAmount = calculateBetSize('monster', pot, player.stack);
      return { action: 'raise', amount: betAmount };
    }
    
    // Strong hands: bet most of the time
    if (handStrength === 'strong') {
      if (randomizeDecision(0.80)) {
        const betAmount = calculateBetSize('strong', pot, player.stack);
        return { action: 'raise', amount: betAmount };
      }
      // Sometimes check to trap
      return { action: 'check' };
    }
    
    // Medium hands: check or make small bet
    if (handStrength === 'medium') {
      if (randomizeDecision(0.50)) {
        const betAmount = calculateBetSize('medium', pot, player.stack);
        return { action: 'raise', amount: betAmount };
      }
      return { action: 'check' };
    }
    
    // Weak hands: check, occasionally bluff (10% frequency)
    if (handStrength === 'weak' && randomizeDecision(0.10)) {
      const betAmount = calculateBetSize('weak', pot, player.stack, true);
      return { action: 'raise', amount: betAmount };
    }
    
    // Default: check
    return { action: 'check' };
  }
  
  // Facing a bet
  // Monster hands: raise
  if (handStrength === 'monster') {
    const raiseAmount = calculateBetSize('monster', pot, player.stack);
    return { action: 'raise', amount: raiseAmount };
  }
  
  // Strong hands: call or raise
  if (handStrength === 'strong') {
    // Large bets: call
    if (amountToCall > pot * 0.75) {
      return { action: 'call' };
    }
    // Otherwise raise
    if (randomizeDecision(0.60)) {
      const raiseAmount = calculateBetSize('strong', pot, player.stack);
      return { action: 'raise', amount: raiseAmount };
    }
    return { action: 'call' };
  }
  
  // Medium hands: call if pot odds are good
  if (handStrength === 'medium') {
    if (potOdds > 3 || amountToCall < pot * 0.50) {
      return { action: 'call' };
    }
    // Fold to large bets
    return { action: 'fold' };
  }
  
  // Weak hands: fold to bets, unless pot odds are very good
  if (handStrength === 'weak') {
    if (potOdds > 6 && amountToCall < pot * 0.25) {
      return { action: 'call' };
    }
    return { action: 'fold' };
  }
  
  // Trash hands: fold
  return { action: 'fold' };
};

/**
 * Main AI decision function that routes to preflop or post-flop logic.
 * @param player The AI player making the decision.
 * @param gameState The current game state.
 * @param playerIndex The index of the AI player.
 * @returns The AI's decision.
 */
export const makeAIDecision = (
  player: Player,
  gameState: GameState,
  playerIndex: number
): AIAction => {
  if (gameState.gamePhase === GamePhase.PREFLOP) {
    return makePreflopDecision(player, gameState, playerIndex);
  } else {
    return makePostFlopDecision(player, gameState, playerIndex);
  }
};

// ============================================================================
// AI TURN MANAGEMENT
// ============================================================================

/**
 * Executes an AI player's turn with appropriate timing and decision logic.
 * Returns a promise that resolves with the AI's action after a thinking delay.
 * @param player The AI player taking their turn.
 * @param gameState The current game state.
 * @param playerIndex The index of the AI player.
 * @returns A promise that resolves with the AI's action.
 */
export const executeAITurn = async (
  player: Player,
  gameState: GameState,
  playerIndex: number
): Promise<AIAction> => {
  // Simulate "thinking" delay (fixed 1.5 seconds)
  const thinkingDelay = 1500;
  
  await new Promise(resolve => setTimeout(resolve, thinkingDelay));
  
  // Make AI decision
  const decision = makeAIDecision(player, gameState, playerIndex);
  
  return decision;
};

/**
 * Checks if it's currently an AI player's turn.
 * @param gameState The current game state.
 * @returns true if the current player is an AI player.
 */
export const isAITurn = (gameState: GameState): boolean => {
  const currentPlayerIndex = gameState.bettingState.currentPlayerIndex;
  if (currentPlayerIndex < 0 || currentPlayerIndex >= gameState.players.length) {
    return false;
  }
  
  const currentPlayer = gameState.players[currentPlayerIndex];
  return !currentPlayer.isYou && !currentPlayer.isEliminated;
};

/**
 * Gets the current player whose turn it is.
 * @param gameState The current game state.
 * @returns The current player, or null if no valid player.
 */
export const getCurrentPlayer = (gameState: GameState): Player | null => {
  const currentPlayerIndex = gameState.bettingState.currentPlayerIndex;
  if (currentPlayerIndex < 0 || currentPlayerIndex >= gameState.players.length) {
    return null;
  }
  
  return gameState.players[currentPlayerIndex];
};