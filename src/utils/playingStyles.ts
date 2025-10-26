import { Player, GameState, PlayingStyle } from '../types';
import { 
  AIAction, 
  HandTier, 
  PostFlopStrength, 
  Position,
  getHandTier,
  evaluatePostFlopStrength,
  getPosition,
  isLatePosition
} from './aiUtils';
import { BIG_BLIND } from './gameActions';

/**
 * Playing Style Configurations for No Limit Hold'em
 * 
 * Each style has different tendencies for:
 * - Hand selection (VPIP - Voluntarily Put money In Pot %)
 * - Aggression (PFR - PreFlop Raise %, aggression factor)
 * - Bet sizing preferences
 * - Bluff frequency
 * - Call/fold tendencies
 */

interface StyleConfig {
  vpip: number; // % of hands played (0-1)
  pfr: number; // % of hands raised preflop (0-1)
  aggressionFactor: number; // Ratio of bets/raises to calls (1-5+)
  bluffFrequency: number; // How often to bluff (0-1)
  callDownFrequency: number; // Tendency to call bets (0-1)
  minBetSizePct: number; // Minimum bet as % of pot
  maxBetSizePct: number; // Maximum bet as % of pot
  threeBetFrequency: number; // How often to 3-bet (0-1)
  foldToCBet: number; // How often to fold to continuation bets (0-1)
}

const STYLE_CONFIGS: Record<PlayingStyle, StyleConfig> = {
  'tight-aggressive': {
    vpip: 0.20, // Plays 20% of hands
    pfr: 0.15, // Raises 15% of hands
    aggressionFactor: 3.0, // Aggressive when in hand
    bluffFrequency: 0.15,
    callDownFrequency: 0.30,
    minBetSizePct: 0.50,
    maxBetSizePct: 0.75,
    threeBetFrequency: 0.08,
    foldToCBet: 0.60,
  },
  'loose-aggressive': {
    vpip: 0.35, // Plays 35% of hands
    pfr: 0.25, // Raises 25% of hands
    aggressionFactor: 3.5,
    bluffFrequency: 0.25,
    callDownFrequency: 0.40,
    minBetSizePct: 0.60,
    maxBetSizePct: 1.00,
    threeBetFrequency: 0.12,
    foldToCBet: 0.50,
  },
  'tight-passive': {
    vpip: 0.18, // Plays 18% of hands
    pfr: 0.08, // Rarely raises
    aggressionFactor: 1.5,
    bluffFrequency: 0.05,
    callDownFrequency: 0.50,
    minBetSizePct: 0.40,
    maxBetSizePct: 0.60,
    threeBetFrequency: 0.03,
    foldToCBet: 0.70,
  },
  'loose-passive': {
    vpip: 0.40, // Plays 40% of hands
    pfr: 0.10, // Rarely raises
    aggressionFactor: 1.2,
    bluffFrequency: 0.08,
    callDownFrequency: 0.65,
    minBetSizePct: 0.35,
    maxBetSizePct: 0.55,
    threeBetFrequency: 0.04,
    foldToCBet: 0.55,
  },
  'maniac': {
    vpip: 0.50, // Plays 50% of hands
    pfr: 0.40, // Raises 40% of hands
    aggressionFactor: 5.0, // Extremely aggressive
    bluffFrequency: 0.40,
    callDownFrequency: 0.35,
    minBetSizePct: 0.75,
    maxBetSizePct: 2.00, // Overbets
    threeBetFrequency: 0.25,
    foldToCBet: 0.30,
  },
  'rock': {
    vpip: 0.12, // Plays only 12% of hands
    pfr: 0.10, // Raises 10% of hands
    aggressionFactor: 2.5,
    bluffFrequency: 0.02,
    callDownFrequency: 0.20,
    minBetSizePct: 0.50,
    maxBetSizePct: 0.70,
    threeBetFrequency: 0.05,
    foldToCBet: 0.75,
  },
  'calling-station': {
    vpip: 0.45, // Plays 45% of hands
    pfr: 0.08, // Rarely raises
    aggressionFactor: 0.8, // Calls more than bets
    bluffFrequency: 0.03,
    callDownFrequency: 0.80, // Calls way too much
    minBetSizePct: 0.30,
    maxBetSizePct: 0.50,
    threeBetFrequency: 0.02,
    foldToCBet: 0.35, // Doesn't fold enough
  },
  'shark': {
    vpip: 0.25, // Balanced
    pfr: 0.18, // Balanced
    aggressionFactor: 2.8,
    bluffFrequency: 0.18,
    callDownFrequency: 0.35,
    minBetSizePct: 0.50,
    maxBetSizePct: 0.85,
    threeBetFrequency: 0.10,
    foldToCBet: 0.58,
  },
};

/**
 * Determines if the AI should play this hand based on their playing style
 */
function shouldPlayHand(
  handTier: HandTier,
  position: Position,
  style: PlayingStyle,
  hasBeenRaised: boolean
): boolean {
  const config = STYLE_CONFIGS[style];
  
  // Base playability score
  let playScore = 0;
  
  if (handTier === 'strong') {
    playScore = 0.95;
  } else if (handTier === 'playable') {
    playScore = 0.50;
  } else {
    playScore = 0.10;
  }
  
  // Adjust for position
  if (isLatePosition(position)) {
    playScore *= 1.3;
  } else if (position === 'early') {
    playScore *= 0.7;
  }
  
  // Adjust for raises
  if (hasBeenRaised) {
    playScore *= 0.5;
  }
  
  // Compare to VPIP
  return Math.random() < Math.min(playScore, config.vpip * 2);
}

/**
 * Calculates No Limit Hold'em bet sizing based on playing style
 */
function calculateNLHBetSize(
  style: PlayingStyle,
  strength: PostFlopStrength | 'strong_preflop',
  pot: number,
  playerStack: number,
  isBluff: boolean = false
): number {
  const config = STYLE_CONFIGS[style];
  
  let betPct: number;
  
  if (isBluff) {
    // Bluff sizing varies by style
    if (style === 'maniac') {
      betPct = 0.70 + Math.random() * 0.50; // 70-120% pot
    } else {
      betPct = config.minBetSizePct + Math.random() * 0.20;
    }
  } else {
    // Value bet sizing based on strength
    switch (strength) {
      case 'monster':
        // Monsters bet big, but not too big to get paid
        betPct = config.minBetSizePct + (config.maxBetSizePct - config.minBetSizePct) * 0.8;
        break;
      case 'strong':
      case 'strong_preflop':
        betPct = config.minBetSizePct + (config.maxBetSizePct - config.minBetSizePct) * 0.6;
        break;
      case 'medium':
        betPct = config.minBetSizePct + (config.maxBetSizePct - config.minBetSizePct) * 0.4;
        break;
      case 'weak':
        betPct = config.minBetSizePct;
        break;
      default:
        betPct = 0.50;
    }
  }
  
  // Add randomization (±15%)
  const randomization = 0.85 + Math.random() * 0.30;
  let betAmount = Math.floor(pot * betPct * randomization);
  
  // Ensure minimum bet
  betAmount = Math.max(betAmount, BIG_BLIND);
  
  // Cap at stack
  betAmount = Math.min(betAmount, playerStack);
  
  return betAmount;
}

/**
 * Calculates preflop raise size for No Limit Hold'em based on playing style
 */
function calculateNLHPreflopRaise(
  style: PlayingStyle,
  handTier: HandTier,
  position: Position,
  currentBet: number,
  pot: number,
  playerStack: number,
  numCallers: number
): number {
  const config = STYLE_CONFIGS[style];
  
  let raiseSize: number;
  
  if (currentBet === 0 || currentBet === BIG_BLIND) {
    // Opening raise
    if (style === 'maniac') {
      raiseSize = BIG_BLIND * (4 + Math.random() * 3); // 4-7x BB
    } else if (style === 'rock' || style === 'tight-passive') {
      raiseSize = BIG_BLIND * (2.5 + Math.random() * 0.5); // 2.5-3x BB
    } else {
      raiseSize = BIG_BLIND * (2.5 + Math.random() * 1.5); // 2.5-4x BB
    }
    
    // Add 1BB per caller
    raiseSize += numCallers * BIG_BLIND;
  } else {
    // 3-bet or 4-bet
    const isThreeBet = Math.random() < config.threeBetFrequency;
    
    if (isThreeBet || handTier === 'strong') {
      // 3-bet sizing: 3x the raise
      raiseSize = currentBet * 3;
      
      // Maniacs 3-bet bigger
      if (style === 'maniac') {
        raiseSize = currentBet * (3.5 + Math.random() * 1.5);
      }
    } else {
      // Just call
      return currentBet;
    }
  }
  
  // Cap at stack
  raiseSize = Math.min(raiseSize, playerStack);
  
  return Math.floor(raiseSize);
}

/**
 * Makes a playing style-aware preflop decision
 */
export function makeStyleAwarePreflopDecision(
  player: Player,
  gameState: GameState,
  playerIndex: number
): AIAction {
  if (!player.cards || player.cards.length !== 2 || !player.playingStyle) {
    return { action: 'fold' };
  }
  
  const style = player.playingStyle;
  const config = STYLE_CONFIGS[style];
  const [card1, card2] = player.cards;
  const handTier = getHandTier(card1, card2);
  
  // Determine position
  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const position = getPosition(playerIndex, gameState.dealerIndex, activePlayers.length);
  
  const { currentBet, actions } = gameState.bettingState;
  const playerBetInRound = actions
    .filter(action => action.playerId === player.id && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0);
  
  const amountToCall = currentBet - playerBetInRound;
  const hasBeenRaised = actions.some(a => a.action === 'raise' && a.playerId !== player.id);
  const numCallers = actions.filter(a => a.action === 'call').length;
  
  // Check if we should play this hand
  if (!shouldPlayHand(handTier, position, style, hasBeenRaised)) {
    if (amountToCall === 0) {
      return { action: 'check' };
    }
    return { action: 'fold' };
  }
  
  // No bet to call
  if (amountToCall === 0) {
    // Decide whether to raise or check
    const shouldRaise = Math.random() < config.pfr / config.vpip;
    
    if (shouldRaise || (handTier === 'strong' && Math.random() < 0.85)) {
      const raiseAmount = calculateNLHPreflopRaise(
        style,
        handTier,
        position,
        currentBet,
        gameState.pot,
        player.stack,
        numCallers
      );
      return { action: 'raise', amount: raiseAmount };
    }
    
    return { action: 'check' };
  }
  
  // Facing a bet
  const potOdds = gameState.pot / amountToCall;
  
  // Strong hands
  if (handTier === 'strong') {
    // Aggressive styles re-raise more
    if (config.aggressionFactor > 2.5 && Math.random() < 0.70) {
      const raiseAmount = calculateNLHPreflopRaise(
        style,
        handTier,
        position,
        currentBet,
        gameState.pot,
        player.stack,
        numCallers
      );
      return { action: 'raise', amount: raiseAmount };
    }
    return { action: 'call' };
  }
  
  // Playable hands
  if (handTier === 'playable') {
    // Calling stations call more
    if (style === 'calling-station' && Math.random() < 0.80) {
      return { action: 'call' };
    }
    
    // Others call based on position and pot odds
    if (isLatePosition(position) && potOdds > 2) {
      return { action: 'call' };
    }
    
    // Loose styles call more
    if (config.vpip > 0.30 && Math.random() < 0.60) {
      return { action: 'call' };
    }
    
    return { action: 'fold' };
  }
  
  // Weak hands - fold unless calling station with good odds
  if (style === 'calling-station' && potOdds > 4) {
    return { action: 'call' };
  }
  
  return { action: 'fold' };
}

/**
 * Makes a playing style-aware postflop decision
 */
export function makeStyleAwarePostFlopDecision(
  player: Player,
  gameState: GameState,
  playerIndex: number
): AIAction {
  if (!player.cards || player.cards.length !== 2 || !player.playingStyle) {
    return { action: 'fold' };
  }
  
  const style = player.playingStyle;
  const config = STYLE_CONFIGS[style];
  const [card1, card2] = player.cards;
  const { communityCards, pot, bettingState } = gameState;
  const { currentBet, actions } = bettingState;
  
  // Evaluate hand strength
  const handStrength = evaluatePostFlopStrength([card1, card2], communityCards);
  
  const playerBetInRound = actions
    .filter(action => action.playerId === player.id && (action.action === 'bet' || action.action === 'raise' || action.action === 'call'))
    .reduce((sum, action) => sum + (action.amount || 0), 0);
  
  const amountToCall = currentBet - playerBetInRound;
  const hasBeenRaised = actions.some(a => (a.action === 'raise' || a.action === 'bet') && a.playerId !== player.id);
  const potOdds = amountToCall > 0 ? pot / amountToCall : Infinity;
  
  // No bet to call
  if (amountToCall === 0) {
    // Decide whether to bet or check
    let shouldBet = false;
    
    if (handStrength === 'monster') {
      shouldBet = Math.random() < 0.90;
    } else if (handStrength === 'strong') {
      shouldBet = Math.random() < 0.75;
    } else if (handStrength === 'medium') {
      shouldBet = Math.random() < (config.aggressionFactor / 5);
    } else if (handStrength === 'weak') {
      // Bluff based on style
      shouldBet = Math.random() < config.bluffFrequency;
    }
    
    if (shouldBet) {
      const betAmount = calculateNLHBetSize(
        style,
        handStrength,
        pot,
        player.stack,
        handStrength === 'weak' || handStrength === 'trash'
      );
      return { action: 'raise', amount: betAmount };
    }
    
    return { action: 'check' };
  }
  
  // Facing a bet
  // Monster hands: raise
  if (handStrength === 'monster') {
    if (Math.random() < config.aggressionFactor / 5) {
      const raiseAmount = calculateNLHBetSize(style, 'monster', pot, player.stack);
      return { action: 'raise', amount: raiseAmount };
    }
    return { action: 'call' };
  }
  
  // Strong hands
  if (handStrength === 'strong') {
    // Large bets: call or fold based on style
    if (amountToCall > pot * 1.0) {
      if (style === 'calling-station' || Math.random() < config.callDownFrequency) {
        return { action: 'call' };
      }
      return { action: 'fold' };
    }
    
    // Aggressive styles raise more
    if (config.aggressionFactor > 2.5 && Math.random() < 0.50) {
      const raiseAmount = calculateNLHBetSize(style, 'strong', pot, player.stack);
      return { action: 'raise', amount: raiseAmount };
    }
    
    return { action: 'call' };
  }
  
  // Medium hands
  if (handStrength === 'medium') {
    // Calling stations call too much
    if (style === 'calling-station' && Math.random() < 0.75) {
      return { action: 'call' };
    }
    
    // Others call based on pot odds and bet size
    if (potOdds > 3 || amountToCall < pot * 0.50) {
      return { action: 'call' };
    }
    
    // Fold to large bets based on style
    if (Math.random() < config.foldToCBet) {
      return { action: 'fold' };
    }
    
    return { action: 'call' };
  }
  
  // Weak hands
  if (handStrength === 'weak') {
    // Calling stations call with weak hands
    if (style === 'calling-station' && potOdds > 4) {
      return { action: 'call' };
    }
    
    // Others fold unless pot odds are amazing
    if (potOdds > 8 && amountToCall < pot * 0.20) {
      return { action: 'call' };
    }
    
    return { action: 'fold' };
  }
  
  // Trash hands: fold
  return { action: 'fold' };
}

/**
 * Main entry point for style-aware AI decisions
 */
export function makeStyleAwareDecision(
  player: Player,
  gameState: GameState,
  playerIndex: number
): AIAction {
  if (!player.playingStyle) {
    // Fallback to default logic if no style assigned
    return { action: 'fold' };
  }
  
  if (gameState.gamePhase === 'PREFLOP') {
    return makeStyleAwarePreflopDecision(player, gameState, playerIndex);
  } else {
    return makeStyleAwarePostFlopDecision(player, gameState, playerIndex);
  }
}

