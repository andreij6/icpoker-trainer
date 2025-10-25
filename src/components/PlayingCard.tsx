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
    const suitLetterMap: Record<string, string> = { SPADES: 'S', HEARTS: 'H', CLUBS: 'C', DIAMONDS: 'D' };
    const suitSymbolMap: Record<string, { symbol: string; color: string }> = {
        SPADES: { symbol: '♠', color: '#111827' },
        CLUBS: { symbol: '♣', color: '#111827' },
        HEARTS: { symbol: '♥', color: '#dc2626' },
        DIAMONDS: { symbol: '♦', color: '#dc2626' },
    };
    const suitKey = (card.suit as unknown as string) || '';
    const suitLetter = suitLetterMap[suitKey] || 'S';
    const { symbol, color } = suitSymbolMap[suitKey] || suitSymbolMap.SPADES;
    const rankText = card.rank;

    const cardImageUrl = card.imageUrl || `https://deck.of.cards/images/cards/${rankText}${suitLetter}.png`;

    return (
        <div className={`relative ${sizeClass} ${className}`}>
            {/* Fallback text rendering behind image */}
            <div className="absolute inset-0 bg-white rounded-lg border border-gray-200 shadow-md flex items-center justify-center">
                <div className="flex flex-col items-center leading-none select-none">
                    <span className="font-extrabold text-sm" style={{ color }}>{rankText}</span>
                    <span className="text-lg" style={{ color }}>{symbol}</span>
                </div>
            </div>
            <img
                src={cardImageUrl}
                alt={`${rankText} of ${card.suit}`}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
        </div>
    );
};

export default PlayingCard;