/**
 * Utilities for managing AI coach integration with the game flow.
 */

import { GameState, Player } from '../types';
import { getAutomaticCoaching, getPostActionFeedback } from '../services/geminiService';

/**
 * Determines if it's currently the user's turn.
 * 
 * @param gameState The current game state.
 * @returns True if it's the user's turn to act.
 */
export function isUserTurn(gameState: GameState): boolean {
  const currentPlayer = gameState.players[gameState.bettingState.currentPlayerIndex];
  return currentPlayer?.isYou === true;
}

/**
 * Gets the current active player.
 * 
 * @param gameState The current game state.
 * @returns The current player or undefined.
 */
export function getCurrentPlayer(gameState: GameState): Player | undefined {
  return gameState.players[gameState.bettingState.currentPlayerIndex];
}

/**
 * Checks if automatic coaching should be triggered.
 * 
 * Coaching should trigger when:
 * - It's the user's turn
 * - Game is in an active phase (PREFLOP, FLOP, TURN, or RIVER)
 * - User hasn't acted yet this round
 * 
 * @param gameState The current game state.
 * @param hasReceivedCoaching Whether coaching has already been provided this turn.
 * @returns True if automatic coaching should be triggered.
 */
export function shouldTriggerAutoCoaching(
  gameState: GameState,
  hasReceivedCoaching: boolean
): boolean {
  if (hasReceivedCoaching) {
    return false;
  }

  if (!isUserTurn(gameState)) {
    return false;
  }

  // Only provide coaching during active betting rounds
  const activePhases = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];
  if (!activePhases.includes(gameState.gamePhase)) {
    return false;
  }

  return true;
}

/**
 * Manages the automatic coaching flow with timeout and error handling.
 * 
 * @param gameState The current game state.
 * @param onCoachingReceived Callback when coaching advice is received.
 * @param onError Callback if an error occurs.
 * @param timeoutMs Timeout in milliseconds (default: 10000).
 * @returns A promise that resolves when coaching is received or timeout occurs.
 */
export async function requestAutoCoaching(
  gameState: GameState,
  onCoachingReceived: (advice: string) => void,
  onError: (error: string) => void,
  timeoutMs: number = 10000
): Promise<void> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Coaching request timed out')), timeoutMs);
  });

  try {
    const coachingPromise = getAutomaticCoaching(gameState);
    const advice = await Promise.race([coachingPromise, timeoutPromise]);
    onCoachingReceived(advice);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('timeout')) {
      onError('Coach is taking too long to respond. Feel free to make your decision.');
    } else {
      onError('Coach is temporarily unavailable. Make your best decision!');
    }
  }
}

/**
 * Requests post-action feedback with error handling.
 * 
 * @param gameState The game state when the action was made.
 * @param action The action taken (fold/call/raise).
 * @param amount Optional amount for raise actions.
 * @param onFeedbackReceived Callback when feedback is received.
 */
export async function requestPostActionFeedback(
  gameState: GameState,
  action: string,
  amount: number | undefined,
  onFeedbackReceived: (feedback: string) => void
): Promise<void> {
  try {
    const feedback = await getPostActionFeedback(gameState, action, amount);
    if (feedback && feedback.trim()) {
      onFeedbackReceived(feedback);
    }
  } catch (error) {
    console.error('Error getting post-action feedback:', error);
    // Silently fail for feedback - it's optional
  }
}

