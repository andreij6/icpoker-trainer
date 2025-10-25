import React from 'react';
import { Player as PlayerType, PlayerStatus } from '../types';
import PlayingCard from './PlayingCard';

interface PlayerProps {
  player: PlayerType;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  const isFolded = player.status === PlayerStatus.Folded;

  return (
    <div className={`flex flex-col items-center text-center cursor-pointer ${isFolded ? 'grayscale opacity-50' : ''}`}>
        <div className="flex items-center gap-1 mb-2 h-16">
            {!isFolded && (
                <>
                    <div className="w-12 h-16 bg-[#1A3A2A] rounded-md shadow-lg border border-white/10"></div>
                    <div className="w-12 h-16 bg-[#1A3A2A] rounded-md shadow-lg border border-white/10"></div>
                </>
            )}
        </div>
        <div className="relative">
            <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16 border-2 border-white/20"
                style={{backgroundImage: `url("${player.avatarUrl}")`}}
                data-alt={`Avatar for ${player.name}`}
            ></div>
            {player.isDealer && (
                 <div className="absolute -top-1 -right-1 bg-white/80 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">D</div>
            )}
        </div>
        <span className="text-white font-bold mt-1 text-sm">{player.name}</span>
        <span className={`${isFolded ? 'text-white/60' : 'text-primary'} font-semibold text-sm`}>
            {isFolded ? 'Folded' : `$${player.stack.toLocaleString()}`}
        </span>
    </div>
  );
};

export default Player;