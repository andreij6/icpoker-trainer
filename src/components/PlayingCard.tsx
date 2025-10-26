import React from 'react';
import { Card } from '../types';

/**
 * Props for the PlayingCard component.
 */
interface PlayingCardProps {
  /** The card data to display. If undefined, the card is assumed to be face down. */
  card?: Card;
  /** Whether the card should be displayed face up or face down. */
  isFaceUp: boolean;
  /** Additional CSS classes to apply to the component. */
  className?: string;
  /** The size of the card. */
  size?: 'small' | 'medium' | 'large' | 'xl';
}

/**
 * A mapping of card sizes to their corresponding CSS classes.
 */
const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-20 h-28',
    large: 'w-24 h-36',
    xl: 'w-40 h-56',
}

/**
 * A component that displays a single playing card.
 *
 * This component can display a card either face up or face down. When face up, it shows the
 * card's image. When face down, it shows a generic card back. The size of the card can be
 * customized.
 *
 * @param {PlayingCardProps} props The props for the component.
 */
const PlayingCard: React.FC<PlayingCardProps> = ({ card, isFaceUp, className = '', size = 'medium' }) => {
    const sizeClass = sizeClasses[size];

    if (!isFaceUp) {
        return (
            <div className={`bg-[#1A3A2A] rounded-md shadow-lg border border-white/10 ${sizeClass} ${className}`} />
        );
    }

    if (!card) return null;

    // Try image first; fallback to text-based render
    const suitSymbolMap: Record<string, { symbol: string; color: string; letter: string }> = {
        SPADES: { symbol: '♠', color: '#111827', letter: 'S' },
        CLUBS: { symbol: '♣', color: '#111827', letter: 'C' },
        HEARTS: { symbol: '♥', color: '#dc2626', letter: 'H' },
        DIAMONDS: { symbol: '♦', color: '#dc2626', letter: 'D' },
    };
    
    // Handle suit as enum or string
    const suitKey = String(card.suit).toUpperCase();
    const suitData = suitSymbolMap[suitKey] || suitSymbolMap.SPADES;
    const { symbol, color, letter: suitLetter } = suitData;
    const rankText = card.rank;
    
    // DeckOfCardsAPI uses "0" for rank 10, not "10"
    const apiRank = rankText === '10' ? '0' : rankText;

    const cardImageUrl = card.imageUrl || `https://deckofcardsapi.com/static/img/${apiRank}${suitLetter}.png`;

    const [imageError, setImageError] = React.useState(false);

    return (
        <div className={`relative ${sizeClass} ${className}`}>
            {/* Show custom card design only if image fails to load */}
            {imageError && (
                <div className="absolute inset-0 bg-white rounded-lg border-2 border-gray-300 shadow-xl flex flex-col p-1">
                    {/* Top left corner */}
                    <div className="flex flex-col items-start leading-none select-none">
                        <span className="font-bold text-base" style={{ color }}>{rankText}</span>
                        <span className="text-sm -mt-0.5" style={{ color }}>{symbol}</span>
                    </div>
                    
                    {/* Center symbol */}
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-5xl" style={{ color }}>{symbol}</span>
                    </div>
                    
                    {/* Bottom right corner (rotated) */}
                    <div className="flex flex-col items-end leading-none select-none rotate-180">
                        <span className="font-bold text-base" style={{ color }}>{rankText}</span>
                        <span className="text-sm -mt-0.5" style={{ color }}>{symbol}</span>
                    </div>
                </div>
            )}
            {/* Card image - show by default */}
            {!imageError && (
                <img
                    src={cardImageUrl}
                    alt={`${rankText} of ${card.suit}`}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    onError={() => setImageError(true)}
                />
            )}
        </div>
    );
};

export default PlayingCard;