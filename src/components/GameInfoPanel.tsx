import React, { useEffect, useRef, useState } from 'react';
import useGameStore from '../store/gameStore';
import { evaluateHand } from '../utils/handEvaluator';
import { GamePhase, PlayerStatus } from '../types';

/**
 * A component that displays key game information including pot size, game phase,
 * and the user's hand strength hint. Also shows winner information when hand is complete.
 */
const GameInfoPanel: React.FC = () => {
  const { pot, gamePhase, players, communityCards, winningHandType, lastWinner, lastWinningHandType, startNewHand } = useGameStore();
  const timerRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  const userPlayer = players.find(p => p.isYou);
  const isHandComplete = gamePhase === GamePhase.HAND_COMPLETE;
  
  // Auto-advance to next hand after 3 seconds with countdown
  useEffect(() => {
    if (isHandComplete) {
      setCountdown(3);
      
      // Countdown timer
      const countdownInterval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto-advance timer
      timerRef.current = window.setTimeout(() => {
        startNewHand();
      }, 3000);
      
      return () => {
        clearInterval(countdownInterval);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isHandComplete, startNewHand]);
  
  const handleNextHand = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startNewHand();
  };
  
  // Determine hand strength for user
  let handStrength = 'No cards yet';
  if (userPlayer && userPlayer.cards && userPlayer.cards.length === 2) {
    if (communityCards.length > 0) {
      // Evaluate full hand with community cards
      const handResult = evaluateHand(userPlayer.cards, communityCards);
      handStrength = handResult.description;
    } else {
      // Preflop - just show hole cards
      const card1 = userPlayer.cards[0];
      const card2 = userPlayer.cards[1];
      const rank1 = card1.rank;
      const rank2 = card2.rank;
      
      if (rank1 === rank2) {
        handStrength = `Pair of ${rank1}s`;
      } else {
        const suited = card1.suit === card2.suit ? ' suited' : '';
        handStrength = `${rank1}-${rank2}${suited}`;
      }
    }
  }
  
  // Format game phase for display
  const phaseDisplay = gamePhase === GamePhase.PRE_DEAL ? 'Waiting to Start' : 
                       gamePhase === GamePhase.PREFLOP ? 'Pre-Flop' :
                       gamePhase === GamePhase.HAND_COMPLETE ? 'Hand Complete' : gamePhase;

  // Find winner for hand complete display
  const potentialWinners = players.filter(p => p.status === PlayerStatus.Active);
  const winner = potentialWinners.length > 0 ? potentialWinners[0] : null;

  // Show winner information when hand is complete
  if (isHandComplete && winner) {
    return (
      <div className="bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 border-2 border-yellow-400 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-6">
          {/* Left spacer */}
          <div className="w-40"></div>
          
          {/* Center: Winner Info */}
          <div className="flex items-center gap-6 flex-1 justify-center">
            <span className="text-4xl">🏆</span>
            <div className="flex flex-col items-center">
              <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider mb-1">
                Winner
              </span>
              <span className="text-white text-2xl font-bold">
                {winner.name}
              </span>
              {winningHandType && (
                <span className="text-yellow-200 text-lg font-semibold mt-1">
                  {winningHandType}
                </span>
              )}
            </div>
            <span className="text-4xl">🏆</span>
          </div>
          
          {/* Right: Next Hand Button */}
          <div className="w-40 flex justify-end">
            <button
              onClick={handleNextHand}
              className="bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg whitespace-nowrap"
            >
              Next Hand {countdown > 0 && `(${countdown}s)`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/90 to-green-800/90 border-2 border-yellow-500/50 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between gap-8">
        {/* Pot Size */}
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
            Current Pot
          </span>
          <span className="text-white text-3xl font-bold">
            ${pot.toLocaleString()}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-16 w-px bg-yellow-500/30"></div>
        
        {/* Game Phase */}
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
            Game Phase
          </span>
          <span className="text-white text-xl font-bold">
            {phaseDisplay}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-16 w-px bg-yellow-500/30"></div>
        
        {/* Hand Strength */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
            Your Hand
          </span>
          <span className="text-white text-lg font-bold text-center">
            {handStrength}
          </span>
        </div>
        
        {/* Last Winner (if available) */}
        {lastWinner && (
          <>
            {/* Divider */}
            <div className="h-16 w-px bg-yellow-500/30"></div>
            
            <div className="flex flex-col items-center min-w-[180px]">
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
                Last Winner
              </span>
              <span className="text-white text-lg font-bold text-center">
                {lastWinner}
              </span>
              {lastWinningHandType && (
                <span className="text-yellow-200 text-sm font-medium text-center mt-1">
                  {lastWinningHandType}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameInfoPanel;

