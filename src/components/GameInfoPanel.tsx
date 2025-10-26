import React, { useEffect, useRef, useState } from 'react';
import useGameStore from '../store/gameStore';
import { evaluateHand } from '../utils/handEvaluator';
import { GamePhase, PlayerStatus } from '../types';
import { cyclesToHands, formatCycles } from '../utils/cyclesUtils';

/**
 * A component that displays key game information including pot size, game phase,
 * and the user's hand strength hint. Also shows winner information when hand is complete.
 */
const GameInfoPanel: React.FC = () => {
  const { pot, sidePots, gamePhase, players, communityCards, winningHandType, lastWinner, lastWinningHandType, cyclesBalance, handsCompleted, startNewHand } = useGameStore();
  const timerRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  const userPlayer = players.find(p => p.isYou);
  const isHandComplete = gamePhase === GamePhase.HAND_COMPLETE;
  const handsLeft = cyclesToHands(cyclesBalance);
  const formattedCycles = formatCycles(cyclesBalance);
  
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
      // Use descr property which gives the full description (e.g., "Ace High", "Pair of Kings")
      handStrength = handResult.descr || handResult.name || 'Unknown Hand';
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
    <div className="bg-gradient-to-r from-[#1E2A3F]/90 to-[#2A3B52]/90 border-2 border-yellow-500/30 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between gap-8">
        {/* Cycles Balance */}
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
            Cycles
          </span>
          <span className="text-white text-lg font-bold">
            {formattedCycles}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-16 w-px bg-yellow-500/30"></div>
        
        {/* Hands Left */}
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
            Hands Left
          </span>
          <span className={`text-lg font-bold ${handsLeft < 10 ? 'text-red-400' : 'text-white'}`}>
            {handsLeft.toLocaleString()}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-16 w-px bg-yellow-500/30"></div>
        
        {/* Pot Size - Highlighted Golden Box */}
        <div className="bg-[#F7C04A] rounded-lg px-4 py-3 flex flex-col items-start min-w-[140px]">
          <span className="text-[#1E2A40] text-xs font-semibold uppercase tracking-wider mb-1 opacity-85">
            {sidePots && sidePots.length > 0 ? 'Main Pot' : 'Current Pot'}
          </span>
          <span className="text-[#1E2A40] text-[32px] font-bold leading-tight">
            ${pot.toLocaleString()}
          </span>
          
          {/* Side Pots */}
          {sidePots && sidePots.length > 0 && (
            <div className="mt-2 space-y-1">
              {sidePots.map((sidePot, index) => (
                <div key={index} className="text-left">
                  <span className="text-[#1E2A40] text-xs font-semibold opacity-75">
                    Side Pot {index + 1}:
                  </span>
                  <span className="text-[#1E2A40] text-sm font-bold ml-2">
                    ${sidePot.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
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
        
        {/* Players in Hand */}
        {(() => {
          const activePlayers = players.filter(p => p.status === 'ACTIVE' && !p.isEliminated);
          const activeCount = activePlayers.length;
          let handText = '';
          
          if (activeCount === 2) {
            handText = 'Heads Up';
          } else if (activeCount === 3) {
            handText = '3-Handed';
          } else if (activeCount > 3) {
            handText = `${activeCount}-Handed`;
          }
          
          return handText ? (
            <>
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Players
                </span>
                <span className="text-white text-lg font-bold">
                  {handText}
                </span>
              </div>
              {/* Divider */}
              <div className="h-16 w-px bg-yellow-500/30"></div>
            </>
          ) : null;
        })()}

        
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

