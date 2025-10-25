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