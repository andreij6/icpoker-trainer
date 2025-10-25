/**
 * Custom React hook for managing AI coaching integration.
 * 
 * This hook handles:
 * - Automatic coaching triggers when it's the user's turn
 * - Manual coaching requests via "Get Advice" button
 * - Post-action feedback
 * - Chat message management
 * - Loading states and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ChatMessage } from '../types';
import { shouldTriggerAutoCoaching, isUserTurn, requestAutoCoaching, requestPostActionFeedback } from '../utils/coachingUtils';
import { getAICoachSuggestion } from '../services/geminiService';

interface UseCoachingOptions {
  /** Whether automatic coaching is enabled. */
  autoCoachingEnabled?: boolean;
  /** Whether post-action feedback is enabled. */
  feedbackEnabled?: boolean;
}

interface UseCoachingReturn {
  /** Array of chat messages. */
  messages: ChatMessage[];
  /** Whether the coach is currently loading. */
  isLoading: boolean;
  /** Whether automatic advice is being loaded. */
  isAutoAdviceLoading: boolean;
  /** The latest coaching advice (for prominent display). */
  latestAdvice: string | undefined;
  /** Function to manually request coaching advice. */
  requestAdvice: () => void;
  /** Function to send a chat message/question to the coach. */
  sendMessage: (message: string) => void;
  /** Function to request feedback on a user action. */
  requestFeedback: (action: string, amount?: number) => void;
  /** Function to clear all messages. */
  clearMessages: () => void;
}

/**
 * Hook for managing AI coaching features in the poker game.
 * 
 * @param gameState The current game state.
 * @param options Configuration options for coaching behavior.
 * @returns Coaching state and control functions.
 * 
 * @example
 * ```tsx
 * const {
 *   messages,
 *   isLoading,
 *   latestAdvice,
 *   requestAdvice,
 *   sendMessage
 * } = useCoaching(gameState, { autoCoachingEnabled: true });
 * 
 * // In your component:
 * <AIAssistant
 *   messages={messages}
 *   isLoading={isLoading}
 *   latestAdvice={latestAdvice}
 *   onGetAdvice={requestAdvice}
 *   onSendMessage={sendMessage}
 *   isUserTurn={isUserTurn(gameState)}
 * />
 * ```
 */
export function useCoaching(
  gameState: GameState,
  options: UseCoachingOptions = {}
): UseCoachingReturn {
  const {
    autoCoachingEnabled = true,
    feedbackEnabled = false
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoAdviceLoading, setIsAutoAdviceLoading] = useState(false);
  const [latestAdvice, setLatestAdvice] = useState<string | undefined>();
  const [hasReceivedAutoCoaching, setHasReceivedAutoCoaching] = useState(false);
  
  // Track previous state to detect changes
  const prevIsUserTurn = useRef(false);
  const prevGamePhase = useRef(gameState.gamePhase);
  const prevCurrentPlayerIndex = useRef(gameState.bettingState.currentPlayerIndex);

  // Reset coaching flag when turn changes
  useEffect(() => {
    const currentIsUserTurn = isUserTurn(gameState);
    const currentPlayerIndex = gameState.bettingState.currentPlayerIndex;
    const currentGamePhase = gameState.gamePhase;

    // Reset if turn changed or phase changed
    if (
      prevIsUserTurn.current !== currentIsUserTurn ||
      prevCurrentPlayerIndex.current !== currentPlayerIndex ||
      prevGamePhase.current !== currentGamePhase
    ) {
      setHasReceivedAutoCoaching(false);
      prevIsUserTurn.current = currentIsUserTurn;
      prevCurrentPlayerIndex.current = currentPlayerIndex;
      prevGamePhase.current = currentGamePhase;
    }
  }, [gameState]);

  // Automatic coaching trigger
  useEffect(() => {
    if (!autoCoachingEnabled) {
      return;
    }

    if (shouldTriggerAutoCoaching(gameState, hasReceivedAutoCoaching)) {
      setIsAutoAdviceLoading(true);
      
      requestAutoCoaching(
        gameState,
        (advice) => {
          setLatestAdvice(advice);
          setMessages(prev => [
            ...prev,
            { author: 'AI', text: advice, timestamp: new Date() }
          ]);
          setHasReceivedAutoCoaching(true);
          setIsAutoAdviceLoading(false);
        },
        (error) => {
          setMessages(prev => [
            ...prev,
            { author: 'AI', text: error, timestamp: new Date() }
          ]);
          setHasReceivedAutoCoaching(true);
          setIsAutoAdviceLoading(false);
        }
      );
    }
  }, [gameState, hasReceivedAutoCoaching, autoCoachingEnabled]);

  /**
   * Manually request coaching advice (via "Get Advice" button).
   */
  const requestAdvice = useCallback(async () => {
    if (isLoading || isAutoAdviceLoading) {
      return;
    }

    setIsAutoAdviceLoading(true);

    try {
      await requestAutoCoaching(
        gameState,
        (advice) => {
          setLatestAdvice(advice);
          setMessages(prev => [
            ...prev,
            { author: 'AI', text: advice, timestamp: new Date() }
          ]);
          setIsAutoAdviceLoading(false);
        },
        (error) => {
          setMessages(prev => [
            ...prev,
            { author: 'AI', text: error, timestamp: new Date() }
          ]);
          setIsAutoAdviceLoading(false);
        }
      );
    } catch (error) {
      setIsAutoAdviceLoading(false);
    }
  }, [gameState, isLoading, isAutoAdviceLoading]);

  /**
   * Send a chat message/question to the coach.
   */
  const sendMessage = useCallback(async (message: string) => {
    if (isLoading) {
      return;
    }

    // Add user message
    setMessages(prev => [
      ...prev,
      { author: 'User', text: message, timestamp: new Date() }
    ]);

    setIsLoading(true);

    try {
      const response = await getAICoachSuggestion(gameState, message);
      setMessages(prev => [
        ...prev,
        { author: 'AI', text: response, timestamp: new Date() }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { author: 'AI', text: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [gameState, isLoading]);

  /**
   * Request feedback on a user's action.
   */
  const requestFeedback = useCallback(async (action: string, amount?: number) => {
    if (!feedbackEnabled) {
      return;
    }

    await requestPostActionFeedback(
      gameState,
      action,
      amount,
      (feedback) => {
        setMessages(prev => [
          ...prev,
          { author: 'AI', text: `💡 ${feedback}`, timestamp: new Date() }
        ]);
      }
    );
  }, [gameState, feedbackEnabled]);

  /**
   * Clear all messages.
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLatestAdvice(undefined);
  }, []);

  return {
    messages,
    isLoading,
    isAutoAdviceLoading,
    latestAdvice,
    requestAdvice,
    sendMessage,
    requestFeedback,
    clearMessages
  };
}

