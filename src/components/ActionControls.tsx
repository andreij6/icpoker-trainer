import React, { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { isUserTurn as computeIsUserTurn } from '../utils/coachingUtils';
import { progressGamePhase } from '../utils/gameActions';
import { PlayerStatus } from '../types';
import { BIG_BLIND } from '../utils/gameActions';

/**
 * A component that provides the user with poker action controls like fold, check, call, bet, and raise.
 *
 * This component connects to the game store and enables/disables buttons based on game state.
 * It validates actions before executing them and provides visual feedback.
 */
const ActionControls: React.FC = () => {
    const { players, communityCards, pot, bettingState, gamePhase, playerFold, playerCall, playerRaise, playerCheck, isAutoPlaying, setAutoPlaying, updateState, skipToNextHand } = useGameStore();
    
    // Find the user player
    const userPlayer = players.find(p => p.isYou);
    const currentPlayer = players[bettingState.currentPlayerIndex];
    const isUserTurn = currentPlayer?.isYou === true;
    const isUserFolded = userPlayer?.status === PlayerStatus.Folded;
    const userHasCards = Boolean(userPlayer?.cards && userPlayer.cards.length === 2);
    const flopShowing = (communityCards?.length || 0) >= 3 || gamePhase === 'FLOP' || gamePhase === 'TURN' || gamePhase === 'RIVER' || gamePhase === 'SHOWDOWN' || gamePhase === 'HAND_COMPLETE';
    
    const playerStack = userPlayer?.stack || 0;
    const currentPlayerBetInRound = bettingState.actions
      .filter(a => a.playerId === userPlayer?.id)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    const toCall = Math.max(0, bettingState.currentBet - currentPlayerBetInRound);
    
    // Minimum raise is current bet + big blind
    const minRaise = bettingState.currentBet + BIG_BLIND;
    const minBet = toCall > 0 ? minRaise : BIG_BLIND;
    
    // ALL HOOKS MUST BE CALLED BEFORE ANY RETURNS
    const [showBetOptions, setShowBetOptions] = useState(false);
    const [betAmount, setBetAmount] = useState(minBet);

    useEffect(() => {
        setBetAmount(Math.max(minBet, BIG_BLIND));
    }, [showBetOptions, minBet]);
    
    // NOW we can do conditional returns
    if (!userPlayer) return null;
    
    // Don't show action buttons when hand is complete
    if (gamePhase === 'HAND_COMPLETE') return null;

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBetAmount(Number(e.target.value));
    };

    const handlePresetBet = (amount: number) => {
        const finalAmount = Math.min(amount, playerStack);
        setBetAmount(finalAmount);
    };
    
    const handleFold = () => {
        if (!isUserTurn || !userPlayer) return;
        playerFold(userPlayer.id);
    };
    
    const handleCallOrCheck = () => {
        if (!isUserTurn || !userPlayer) return;
        if (toCall === 0) {
            playerCheck(userPlayer.id);
        } else {
            playerCall(userPlayer.id);
        }
    };

    const handleRaise = () => {
        if (!isUserTurn || !userPlayer) return;
        // Allow all-in even if below minimum, otherwise enforce minimum
        if (!isAllIn && steppedBetAmount < minBet) return; // Invalid raise
        playerRaise(userPlayer.id, steppedBetAmount);
        setShowBetOptions(false);
    };
    
    const handleSkipRound = () => {
        // Immediately end current hand and start the next hand (modal-free)
        skipToNextHand();
        setAutoPlaying(false);
    };
    
    // Make slider move in increments, but allow exact all-in amount
    const sliderSteps = BIG_BLIND;
    const isAllIn = betAmount >= playerStack;
    const steppedBetAmount = isAllIn ? playerStack : Math.max(minBet, Math.round(betAmount / sliderSteps) * sliderSteps);

    if (!isUserTurn) {
        // When it's not the user's turn (table acting before user), allow skipping
        // But if the flop is showing and the user still has cards, hide skip until they fold
        if (flopShowing && userHasCards && !isUserFolded) {
            return null;
        }
        return (
            <div className="flex justify-center items-center gap-4 w-full">
                <button
                    onClick={handleSkipRound}
                    className="bg-white/10 border border-white/20 text-white text-lg font-bold rounded-lg h-12 w-60 hover:bg-white/20 transition-colors"
                >
                    Skip to Next Round
                </button>
            </div>
        );
    }

    if (showBetOptions) {
        return (
            <div className="flex flex-col items-center gap-3 p-3 bg-black/40 rounded-xl w-full max-w-2xl border border-white/10 shadow-lg">
                <div className="flex justify-center w-full gap-2">
                    <button onClick={() => handlePresetBet(pot / 2)} className="flex-1 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-md h-9 px-3 hover:bg-white/20 transition-colors">1/2 Pot</button>
                    <button onClick={() => handlePresetBet(pot)} className="flex-1 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-md h-9 px-3 hover:bg-white/20 transition-colors">Pot</button>
                    <button onClick={() => handlePresetBet(playerStack)} className="flex-1 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-md h-9 px-3 hover:bg-white/20 transition-colors">All In</button>
                </div>
                <div className="flex items-center gap-4 w-full px-2">
                    <input
                        type="range"
                        min={minBet}
                        max={playerStack}
                        step={sliderSteps}
                        value={betAmount}
                        onChange={handleBetChange}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-white font-bold w-28 text-center bg-white/5 rounded-md py-1.5 border border-white/10">${steppedBetAmount.toLocaleString()}</span>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowBetOptions(false)} 
                        className="bg-white/10 text-white text-sm font-bold rounded-lg h-10 px-6 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isUserTurn}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleRaise}
                        className="bg-primary text-background-dark text-sm font-bold rounded-lg h-10 px-6 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isUserTurn || (!isAllIn && steppedBetAmount < minBet) || steppedBetAmount > playerStack}
                    >
                        {toCall > 0 ? `Raise to $${steppedBetAmount.toLocaleString()}` : `Bet $${steppedBetAmount.toLocaleString()}`}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center gap-4 w-full">
            {/* Show compact Skip only if either flop is NOT showing or user already folded */}
            {userPlayer.status === PlayerStatus.Active && (!flopShowing || isUserFolded === true || !userHasCards) && (
                <button 
                    onClick={handleSkipRound}
                    className="bg-white/10 border border-white/20 text-white text-lg font-bold rounded-lg h-12 w-36 hover:bg-white/20 transition-colors"
                >
                    Skip
                </button>
            )}
            <button 
                onClick={handleFold}
                disabled={!isUserTurn}
                className="bg-red-900/80 border border-red-500/50 text-white text-lg font-bold rounded-lg h-12 w-40 hover:bg-red-800/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-900/40"
            >
                Fold
            </button>
            <button 
                onClick={handleCallOrCheck}
                disabled={!isUserTurn || (toCall > playerStack)}
                className="bg-white/10 border border-white/20 text-white text-lg font-bold rounded-lg h-12 w-40 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {toCall > 0 ? `Call $${toCall.toLocaleString()}` : 'Check'}
            </button>
            
            {/* Bet/Raise button - always opens sizing options */}
            <button 
                onClick={() => setShowBetOptions(true)}
                disabled={!isUserTurn || playerStack < BIG_BLIND}
                className="bg-primary text-background-dark text-lg font-bold rounded-lg h-12 w-40 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {toCall === 0 ? 'Bet' : 'Raise'}
            </button>
        </div>
    );
};

export default ActionControls;
