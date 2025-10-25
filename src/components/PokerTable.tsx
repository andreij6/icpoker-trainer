import React from 'react';
import { GamePhase } from '../types';
import useGameStore from '../store/gameStore';
import Player from './Player';
import PlayingCard from './PlayingCard';

/**
 * Calculate the position of a player around the poker table.
 * Players are arranged in a circular/elliptical pattern.
 * @param index The index of the player in the players array
 * @param totalPlayers The total number of players
 * @returns CSS positioning object
 */
const calculatePlayerPosition = (index: number, totalPlayers: number) => {
  // Arrange players in an ellipse around the table
  const angle = (index / totalPlayers) * 2 * Math.PI - Math.PI / 2; // Start at top
  
  // Ellipse parameters (horizontal and vertical radius as percentages)
  const radiusX = 42; // Horizontal spread
  const radiusY = 31; // Vertical spread
  const centerY = 44; // Shift ellipse further upward to give bottom players more room
  
  // Calculate position on ellipse
  const x = 50 + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  };
};

/**
 * Get the blind type for a player (SB or BB)
 * @param playerIndex The index of the player
 * @param dealerIndex The index of the dealer
 * @param totalPlayers The total number of players
 * @returns 'SB' | 'BB' | null
 */
const getBlindType = (playerIndex: number, dealerIndex: number, totalPlayers: number): 'SB' | 'BB' | null => {
  const smallBlindIndex = (dealerIndex + 1) % totalPlayers;
  const bigBlindIndex = (dealerIndex + 2) % totalPlayers;
  
  if (playerIndex === smallBlindIndex) return 'SB';
  if (playerIndex === bigBlindIndex) return 'BB';
  return null;
};

/**
 * A component that renders the main poker table, including players and community cards.
 *
 * This component connects to the Zustand store to get live game state and displays
 * players positioned around the table with dealer button and blind indicators.
 * It also shows the community cards (flop, turn, and river) in the center.
 */
const PokerTable: React.FC = () => {
  const { players, communityCards, pot, gamePhase, dealerIndex, bettingState } = useGameStore();
  
  const flop = communityCards.slice(0, 3);
  const turn = communityCards.slice(3, 4);
  const river = communityCards.slice(4, 5);
  
  // Only show community cards that should be visible in current phase
  const showFlop = [GamePhase.FLOP, GamePhase.TURN, GamePhase.RIVER, GamePhase.SHOWDOWN, GamePhase.HAND_COMPLETE].includes(gamePhase);
  const showTurn = [GamePhase.TURN, GamePhase.RIVER, GamePhase.SHOWDOWN, GamePhase.HAND_COMPLETE].includes(gamePhase);
  const showRiver = [GamePhase.RIVER, GamePhase.SHOWDOWN, GamePhase.HAND_COMPLETE].includes(gamePhase);

  // Build seating order with original indices to preserve dealer/turn mapping
  const seatedPlayers = players
    .map((p, originalIndex) => ({ player: p, originalIndex }))
    .filter(({ player }) => !player.isEliminated);

  // Rotate so that the user sits at a desired visual index (bottom-left by default)
  const targetUserIndex = Math.max(0, Math.floor(seatedPlayers.length * 7 / 9)); // approx bottom-left for 9 seats
  const currentUserIndex = seatedPlayers.findIndex(({ player }) => player.isYou);
  const rotation = currentUserIndex === -1 ? 0 : (targetUserIndex - currentUserIndex + seatedPlayers.length) % seatedPlayers.length;
  const rotated = seatedPlayers.map((_, i) => seatedPlayers[(i - rotation + seatedPlayers.length) % seatedPlayers.length]);

  return (
    <div className="relative w-full xl:h-[700px] lg:h-[640px] md:h-[580px] h-[520px]">
      {/* Table Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 xl:w-[700px] xl:h-[400px] lg:w-[630px] lg:h-[360px] md:w-[560px] md:h-[320px] w-[520px] h-[300px] bg-gradient-to-br from-green-800 to-green-900 rounded-[200px] border-8 border-amber-900 shadow-2xl"></div>
      
      {/* Player Positions */}
      {rotated.map(({ player, originalIndex }, index) => {
        const total = rotated.length;
        const position = calculatePlayerPosition(index, total);
        const isDealer = originalIndex === dealerIndex;
        const blindType = getBlindType(originalIndex, dealerIndex, players.length);
        const isCurrentPlayer = players[bettingState.currentPlayerIndex]?.id === player.id;
        const currentBetInRound = bettingState.actions
          .filter(a => a.playerId === player.id)
          .reduce((sum, a) => sum + (a.amount || 0), 0);
        
        return (
          <div
            key={player.id}
            className="absolute"
            style={position}
          >
            <Player 
              player={player} 
              isDealer={isDealer}
              blindType={blindType}
              isCurrentPlayer={isCurrentPlayer}
              currentBet={currentBetInRound}
              gamePhase={gamePhase}
            />
          </div>
        );
      })}

      {/* Center Table - Community Cards and Pot */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-3">
        <h2 className="text-2xl xl:text-3xl font-bold text-white drop-shadow-lg">
          Pot: ${pot.toLocaleString()}
        </h2>
        <div className="text-xs xl:text-sm text-white/70 font-semibold uppercase tracking-wider">
          {gamePhase}
        </div>
        <div className="flex items-center justify-center gap-3 xl:gap-4 text-white">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/60 font-bold">FLOP</span>
            <div className="flex gap-2">
              {showFlop && flop.length > 0 ? (
                flop.map((card, i) => <PlayingCard key={i} card={card} isFaceUp={true} size="small" />)
              ) : (
                <>
                  <PlayingCard isFaceUp={false} size="small" />
                  <PlayingCard isFaceUp={false} size="small" />
                  <PlayingCard isFaceUp={false} size="small" />
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/60 font-bold">TURN</span>
            {showTurn && turn.length > 0 ? (
              <PlayingCard card={turn[0]} isFaceUp={true} size="small" />
            ) : (
              <PlayingCard isFaceUp={false} size="small" />
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/60 font-bold">RIVER</span>
            {showRiver && river.length > 0 ? (
              <PlayingCard card={river[0]} isFaceUp={true} size="small" />
            ) : (
              <PlayingCard isFaceUp={false} size="small" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;
