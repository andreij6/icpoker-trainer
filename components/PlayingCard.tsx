import React from 'react';
import { Card } from '../types';

interface PlayingCardProps {
  card?: Card;
  isFaceUp: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
}

const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-20 h-28',
    large: 'w-24 h-36',
    xl: 'w-40 h-56',
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, isFaceUp, className = '', size = 'medium' }) => {
    const sizeClass = sizeClasses[size];

    if (!isFaceUp) {
        return (
            <div className={`bg-[#1A3A2A] rounded-md shadow-lg border border-white/10 ${sizeClass} ${className}`}>
            </div>
        );
    }

    if (!card) return null;

    const cardImageUrl = card?.imageUrl || `https://deck.of.cards/images/cards/${card?.rank}${card?.suit.charAt(0)}.png`;

    return (
        <div 
        className={`bg-white rounded-lg shadow-md bg-cover bg-center ${sizeClass} ${className}`}
        style={{ backgroundImage: `url(${cardImageUrl})` }}
        >
        </div>
    );
};

export default PlayingCard;