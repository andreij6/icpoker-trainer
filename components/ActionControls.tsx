import React, { useState, useEffect } from 'react';

interface ActionControlsProps {
    pot: number;
    playerStack: number;
    toCall: number;
}

const ActionControls: React.FC<ActionControlsProps> = ({ pot, playerStack, toCall }) => {
    const [showBetOptions, setShowBetOptions] = useState(false);
    // Simplified logic for minimum raise/bet
    const minBet = toCall > 0 ? toCall * 2 : 50; 
    const [betAmount, setBetAmount] = useState(minBet);

    useEffect(() => {
        setBetAmount(Math.max(minBet, 50));
    }, [showBetOptions, minBet]);

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBetAmount(Number(e.target.value));
    };

    const handlePresetBet = (amount: number) => {
        setBetAmount(Math.floor(Math.min(amount, playerStack)));
    };
    
    // Make slider move in increments
    const sliderSteps = 50;
    const steppedBetAmount = Math.max(minBet, Math.round(betAmount / sliderSteps) * sliderSteps);

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
                    <button onClick={() => setShowBetOptions(false)} className="bg-white/10 text-white text-sm font-bold rounded-lg h-10 px-6 hover:bg-white/20 transition-colors">Cancel</button>
                    <button className="bg-primary text-background-dark text-sm font-bold rounded-lg h-10 px-6 hover:opacity-90 transition-opacity">
                        {toCall > 0 ? `Raise to $${steppedBetAmount.toLocaleString()}` : `Bet $${steppedBetAmount.toLocaleString()}`}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center gap-4 w-full">
            <button className="bg-red-900/80 border border-red-500/50 text-white text-lg font-bold rounded-lg h-12 w-40 hover:bg-red-800/80 transition-colors">Fold</button>
            <button className="bg-white/10 border border-white/20 text-white text-lg font-bold rounded-lg h-12 w-40 hover:bg-white/20 transition-colors">
                {toCall > 0 ? `Call $${toCall.toLocaleString()}` : 'Check'}
            </button>
            <button onClick={() => setShowBetOptions(true)} className="bg-primary text-background-dark text-lg font-bold rounded-lg h-12 w-40 hover:opacity-90 transition-opacity">
                {toCall > 0 ? 'Raise' : 'Bet'}
            </button>
        </div>
    );
};

export default ActionControls;
