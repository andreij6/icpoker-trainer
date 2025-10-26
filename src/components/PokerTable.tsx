import React from 'react';
import { GamePhase } from '../types';
import useGameStore from '../store/gameStore';
import PlayingCard from './PlayingCard';

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
 * A component that renders the poker table in a linear layout.
 *
 * This component connects to the Zustand store to get live game state and displays
 * players in a horizontal row with:
 * - Position 1: Always the user
 * - Position 2: The AI player who currently has action (or next to act if user has action)
 * - Remaining positions: Other players in turn order
 * 
 * The layout uses overflow-hidden with a gradient fade on the right edge to show
 * a "peek" of additional players without horizontal scrolling.
 * Community cards are displayed centered and extra-large above the player row.
 */
const PokerTable: React.FC = () => {
  const { players, communityCards, pot, sidePots, gamePhase, dealerIndex, bettingState } = useGameStore();
  // const [isLinearLayout, setIsLinearLayout] = React.useState(true); // Always use linear layout
  
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

  // Linear layout: User first, then player with current/next action, then others in turn order
  const userSeat = seatedPlayers.find(({ player }) => player.isYou);
  const userIndex = seatedPlayers.findIndex(({ player }) => player.isYou);
  
  // Find the current player (who has action now or next)
  const currentPlayer = players[bettingState.currentPlayerIndex];
  let currentPlayerSeatedIndex = seatedPlayers.findIndex(({ player }) => player.id === currentPlayer?.id);
  
  // If current player is the user, find the next active player
  if (currentPlayerSeatedIndex === userIndex) {
    // Find next active player after user
    for (let i = 1; i < seatedPlayers.length; i++) {
      const checkIdx = (currentPlayerSeatedIndex + i) % seatedPlayers.length;
      const checkPlayer = seatedPlayers[checkIdx].player;
      if (checkPlayer.status === 'ACTIVE' && !checkPlayer.isEliminated) {
        currentPlayerSeatedIndex = checkIdx;
        break;
      }
    }
  }
  
  // Build player order: [User, Current/Next AI player, ...rest in order]
  // Then move folded AI players to the end (but keep user first always)
  const linearPlayers: typeof seatedPlayers = [];
  if (userSeat) {
    linearPlayers.push(userSeat);
  }
  
  // Add the current/next action player as second
  if (currentPlayerSeatedIndex !== -1 && currentPlayerSeatedIndex !== userIndex) {
    linearPlayers.push(seatedPlayers[currentPlayerSeatedIndex]);
  }
  
  // Add remaining players in order, starting from the player after current
  for (let i = 1; i < seatedPlayers.length; i++) {
    const idx = (currentPlayerSeatedIndex + i) % seatedPlayers.length;
    if (idx !== userIndex && idx !== currentPlayerSeatedIndex) {
      linearPlayers.push(seatedPlayers[idx]);
    }
  }
  
  // Separate user, active AI players, and folded AI players
  const userPlayer = linearPlayers.filter(({ player }) => player.isYou);
  const activeAIPlayers = linearPlayers.filter(({ player }) => !player.isYou && player.status === 'ACTIVE');
  const foldedAIPlayers = linearPlayers.filter(({ player }) => !player.isYou && player.status === 'FOLDED');
  const orderedPlayers = [...userPlayer, ...activeAIPlayers, ...foldedAIPlayers];

  return (
    <div className="relative w-full xl:h-[700px] lg:h-[640px] md:h-[580px] h-[520px]">
      {/* LINEAR LAYOUT */}
      <div className="w-full h-full flex flex-col items-center justify-start gap-8 pt-4 pb-8 px-4">
          {/* Community Cards - Centered and Larger */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                {sidePots && sidePots.length > 0 ? 'Main Pot' : 'Pot'}: ${pot.toLocaleString()}
              </h2>
              {sidePots && sidePots.length > 0 && (
                <div className="flex gap-3">
                  {sidePots.map((sidePot, index) => (
                    <div key={index} className="text-base font-semibold text-yellow-300 drop-shadow-lg">
                      Side {index + 1}: ${sidePot.amount.toLocaleString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm text-white/70 font-semibold uppercase tracking-wider">
              {gamePhase}
            </div>
            {/* Fixed height container to prevent layout shift - h-56 matches XL card height (224px) */}
            <div className="flex items-center justify-center gap-4 h-56">
              {/* Flop */}
              {showFlop && flop.length > 0 ? (
                flop.map((card, i) => <PlayingCard key={i} card={card} isFaceUp={true} size="xl" />)
              ) : (
                <>
                  <PlayingCard isPlaceholder={true} size="xl" />
                  <PlayingCard isPlaceholder={true} size="xl" />
                  <PlayingCard isPlaceholder={true} size="xl" />
                </>
              )}
              {/* Turn */}
              {showTurn && turn.length > 0 ? (
                <PlayingCard card={turn[0]} isFaceUp={true} size="xl" />
              ) : (
                <PlayingCard isPlaceholder={true} size="xl" />
              )}
              {/* River */}
              {showRiver && river.length > 0 ? (
                <PlayingCard card={river[0]} isFaceUp={true} size="xl" />
              ) : (
                <PlayingCard isPlaceholder={true} size="xl" />
              )}
            </div>
          </div>

          {/* Stylish Divider */}
          <div className="w-full max-w-4xl flex items-center gap-4 px-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/50"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500/70 animate-pulse"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/50"></div>
          </div>

          {/* Players - Horizontal Row with Peek */}
          <div className="w-full overflow-hidden relative">
            {/* Gradient fade on right edge to show "peek" effect */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0F1B2E] to-transparent pointer-events-none z-10"></div>
            
            <div className="flex items-stretch gap-3 px-4">
            {orderedPlayers.map(({ player, originalIndex }) => {
              const isDealer = originalIndex === dealerIndex;
              const blindType = getBlindType(originalIndex, dealerIndex, players.length);
              const isCurrentPlayer = players[bettingState.currentPlayerIndex]?.id === player.id;
              const currentBetInRound = bettingState.actions
                .filter(a => a.playerId === player.id)
                .reduce((sum, a) => sum + (a.amount || 0), 0);
              const isFolded = player.status === 'FOLDED';
              // Seat number is originalIndex + 1 (to make it 1-based)
              const seatNumber = originalIndex + 1;
              
              return (
                <div
                  key={player.id}
                  className={`flex flex-col items-center justify-between bg-gradient-to-b from-[#1E2A3F]/80 to-[#2A3B52]/80 border-2 ${
                    isCurrentPlayer ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-[#3A4B62]/50'
                  } rounded-lg p-3 min-w-[140px] ${isFolded ? 'grayscale opacity-50' : ''}`}
                >
                  {/* Player Cards */}
                  <div className="flex items-center gap-1 mb-2 h-28">
                    {player.cards && player.cards.length === 2 && player.isYou && !isFolded ? (
                      <>
                        <PlayingCard card={player.cards[0]} isFaceUp={true} size="medium" />
                        <PlayingCard card={player.cards[1]} isFaceUp={true} size="medium" />
                      </>
                    ) : !isFolded ? (
                      <>
                        <div className="w-12 h-16 bg-[radial-gradient(circle,_#dc2626_0%,_#7f1d1d_100%)] rounded-md shadow-lg border-2 border-white"></div>
                        <div className="w-12 h-16 bg-[radial-gradient(circle,_#dc2626_0%,_#7f1d1d_100%)] rounded-md shadow-lg border-2 border-white"></div>
                      </>
                    ) : (
                      // Maintain height when folded with invisible spacer
                      <div className="h-28" />
                    )}
                  </div>

                  {/* Dealer/Blind Badges */}
                  <div className="flex items-center gap-2 mb-1 min-h-[20px]">
                    {isDealer && (
                      <span className="inline-flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded-full bg-white text-black border border-yellow-400">D</span>
                    )}
                    {blindType && (
                      <span className="inline-flex items-center justify-center text-[10px] font-bold w-6 h-5 rounded-full bg-blue-600 text-white border border-blue-300">{blindType}</span>
                    )}
                  </div>

                  {/* Seat Number */}
                  <div className="text-white/60 text-xs font-semibold mb-1">Seat {seatNumber}</div>

                  {/* Player Name */}
                  <div className="text-white font-bold text-sm text-center mb-1">{player.name}</div>

                  {/* Last Action */}
                  {currentBetInRound > 0 && !isFolded && (
                    <div className="text-xs text-yellow-300 font-semibold mb-1">
                      {currentBetInRound === bettingState.currentBet ? 'Calls' : 'Bet'}: ${currentBetInRound}
                    </div>
                  )}
                  {isFolded && (
                    <div className="text-xs text-white/60 font-semibold mb-1">Folded</div>
                  )}

                  {/* Chip Count */}
                  <div className={`${isFolded ? 'text-white/60' : 'text-green-400'} font-semibold text-sm`}>
                    ${player.stack.toLocaleString()}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

      {/* 
        CIRCULAR LAYOUT CODE REMOVED - kept in git history if needed
        To restore: git show HEAD:src/components/PokerTable.tsx
      */}
    </div>
  );
};

export default PokerTable;
