import React from 'react';
import { Player as PlayerType, PlayerStatus, GamePhase } from '../types';
import PlayingCard from './PlayingCard';

/**
 * Props for the Player component.
 */
interface PlayerProps {
  /** The player data to display. */
  player: PlayerType;
  /** Whether this player is the dealer. */
  isDealer?: boolean;
  /** The blind type for this player (SB/BB). */
  blindType?: 'SB' | 'BB' | null;
  /** Whether it's currently this player's turn. */
  isCurrentPlayer?: boolean;
  /** The current bet amount for this player in the round. */
  currentBet?: number;
  /** The current game phase - used to determine if cards should be revealed. */
  gamePhase?: GamePhase;
  /** All players - used to determine if showdown requires revealing cards. */
  allPlayers?: PlayerType[];
  /** The current highest bet in the round (from betting state). */
  currentHighestBet?: number;
}

/**
 * A component that displays a single player at the poker table.
 *
 * This component renders the player's avatar, name, stack size, dealer button,
 * blind indicators, and current bet. It shows the player's cards if they're the user,
 * or at showdown for all players.
 *
 * @param {PlayerProps} props The props for the component.
 */
const Player: React.FC<PlayerProps> = ({ 
  player, 
  isDealer = false, 
  blindType = null, 
  isCurrentPlayer = false,
  currentBet = 0,
  gamePhase = GamePhase.PRE_DEAL,
  allPlayers = [],
  currentHighestBet = 0
}) => {
  const isFolded = player.status === PlayerStatus.Folded;
  const isShowdown = gamePhase === GamePhase.SHOWDOWN || gamePhase === GamePhase.HAND_COMPLETE;
  
  // Count active (non-folded) players
  const activePlayers = allPlayers.filter(p => p.status === PlayerStatus.Active && !p.isEliminated);
  const needsShowdown = activePlayers.length >= 2; // Only show cards if 2+ players go to showdown
  
  // Show cards if:
  // 1. It's the user's cards (always show their own)
  // 2. At showdown AND there are 2+ active players (dealer needs to compare)
  const showCards = (player.isYou || (!isFolded && isShowdown && needsShowdown)) && player.cards && player.cards.length === 2;

  return (
    <div className={`flex flex-col items-center text-center ${isFolded ? 'grayscale opacity-50' : ''}`}>
      {/* Cards Section (moved up since avatars are removed) */}
      <div className="flex items-center gap-1 mb-1 h-28">
        {!isFolded && showCards && player.cards ? (
          <>
            <PlayingCard card={player.cards[0]} isFaceUp={true} size="medium" />
            <PlayingCard card={player.cards[1]} isFaceUp={true} size="medium" />
          </>
        ) : !isFolded ? (
          <>
            <div className="w-12 h-16 bg-gradient-to-br from-blue-900 to-blue-950 rounded-md shadow-lg border border-white/20"></div>
            <div className="w-12 h-16 bg-gradient-to-br from-blue-900 to-blue-950 rounded-md shadow-lg border border-white/20"></div>
          </>
        ) : (
          // Maintain height when folded with invisible spacer
          <div className="h-28" />
        )}
      </div>
      {/* Badges row (dealer / blinds) */}
      <div className="flex items-center gap-2 h-5 mb-1">
        {isDealer && (
          <span className="inline-flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded-full bg-white text-black border border-yellow-400">D</span>
        )}
        {blindType && (
          <span className="inline-flex items-center justify-center text-[10px] font-bold w-6 h-5 rounded-full bg-blue-600 text-white border border-blue-300">{blindType}</span>
        )}
        {isCurrentPlayer && (
          <span className="text-[10px] font-semibold text-yellow-300">Acting</span>
        )}
      </div>

      {/* Player Name */}
      <span className="text-white font-bold mt-1 text-sm">{player.name}</span>

      {/* Stack */}
      <span className={`${isFolded ? 'text-white/60' : 'text-green-400'} font-semibold text-sm`}>
        ${player.stack.toLocaleString()}
      </span>

      {/* Status - show if folded */}
      {isFolded && (
        <span className="text-white/60 text-xs font-semibold">Folded</span>
      )}

      {/* Current Bet */}
      {!isFolded && currentBet > 0 && (
        <div className="mt-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {currentBet === currentHighestBet && currentHighestBet > 0 ? 'Calls' : 'Bet'}: ${currentBet}
        </div>
      )}
    </div>
  );
};

export default Player;