import React from 'react';
import { GameState } from '../types';
import Player from './Player';
import PlayingCard from './PlayingCard';

interface PokerTableProps {
  gameState: GameState;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState }) => {
  const { players, communityCards, pot } = gameState;
  const flop = communityCards.slice(0, 3);
  const turn = communityCards.slice(3, 4);
  const river = communityCards.slice(4, 5);

  return (
    <div className="relative w-full h-[600px] mt-8">
      {/* Player Positions */}
      {players.map((player) => (
        <div
          key={player.id}
          className="absolute"
          // FIX: Property 'position' does not exist on type 'Player'. Added optional chaining because position is optional.
          style={{
            top: player.position?.top,
            left: player.position?.left,
            right: player.position?.right,
            bottom: player.position?.bottom,
            transform: player.position?.transform,
          }}
        >
          <Player player={player} />
        </div>
      ))}

      {/* Center Table */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Pot: ${pot.toLocaleString()}</h2>
        <div className="flex items-center justify-center gap-4 text-white">
            <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400">FLOP</span>
                <div className="flex gap-2">
                    {/* FIX: Property 'isSmall' does not exist on type 'PlayingCardProps'. Replaced with size="small". */}
                    {flop.length > 0 ? flop.map((card, i) => <PlayingCard key={i} card={card} isFaceUp={true} size="small" />) : <><PlayingCard isFaceUp={false} size="small" /><PlayingCard isFaceUp={false} size="small" /><PlayingCard isFaceUp={false} size="small" /></>}
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400">TURN</span>
                {/* FIX: Property 'isSmall' does not exist on type 'PlayingCardProps'. Replaced with size="small". */}
                {turn.length > 0 ? <PlayingCard card={turn[0]} isFaceUp={true} size="small" /> : <PlayingCard isFaceUp={false} size="small" />}
            </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400">RIVER</span>
                {/* FIX: Property 'isSmall' does not exist on type 'PlayingCardProps'. Replaced with size="small". */}
                {river.length > 0 ? <PlayingCard card={river[0]} isFaceUp={true} size="small" /> : <PlayingCard isFaceUp={false} size="small" />}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;
