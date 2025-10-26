import React, { useEffect, useMemo } from 'react';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import ActionControls from './components/ActionControls';
import PokerTable from './components/PokerTable';
import GameInfoPanel from './components/GameInfoPanel';
import { ToastProvider } from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import useGameStore from './store/gameStore';
import { GamePhase, GameState, ChatMessage } from './types';
import { useCoaching } from './hooks/useCoaching';
import { isUserTurn as computeIsUserTurn } from './utils/coachingUtils';
import { isAITurn, getCurrentPlayer, executeAITurn } from './utils/aiUtils';
import { progressGamePhase } from './utils/gameActions';
import { useRef } from 'react';

function App() {
  const {
    players,
    deck,
    communityCards,
    pot,
    gamePhase,
    bettingState,
    dealerIndex,
    lastWinner,
    lastWinningHandType,
    cyclesBalance,
    handsCompleted,
  } = useGameStore();

  const startNewHand = useGameStore((s) => s.startNewHand);
  const updateState = useGameStore((s) => s.updateState);
  const isAutoPlaying = useGameStore((s) => s.isAutoPlaying);
  const setAutoPlaying = useGameStore((s) => s.setAutoPlaying);
  const isHandStarting = useGameStore((s) => s.isHandStarting);
  const playerFold = useGameStore((s) => s.playerFold);
  const playerCall = useGameStore((s) => s.playerCall);
  const playerRaise = useGameStore((s) => s.playerRaise);
  const playerCheck = useGameStore((s) => s.playerCheck);

  // Build a GameState object for hooks/utilities that expect it
  const currentGameState: GameState = useMemo(() => ({
    players,
    deck,
    communityCards,
    pot,
    gamePhase,
    bettingState,
    dealerIndex,
    lastWinner,
    lastWinningHandType,
    cyclesBalance,
    handsCompleted,
  }), [players, deck, communityCards, pot, gamePhase, bettingState, dealerIndex, lastWinner, lastWinningHandType, cyclesBalance, handsCompleted]);

  // Initialize a new hand on first mount if needed
  useEffect(() => {
    if (gamePhase === GamePhase.PRE_DEAL) {
      startNewHand();
    }
  }, [gamePhase, startNewHand]);

  // Simple betting round completion check
  const isBettingRoundOver = (state: GameState): boolean => {
    const { players, bettingState } = state;
    const { currentBet } = bettingState;
    const activePlayers = players.filter(p => p.status === 'ACTIVE' && !p.isEliminated);
    if (activePlayers.length <= 1) return true;
    if (currentBet === 0) {
      // all active players acted => at least one action in this round per active player
      return activePlayers.every(player => bettingState.actions.some(a => a.playerId === player.id));
    }
    // all active players matched current bet
    for (const player of activePlayers) {
      const betInRound = bettingState.actions
        .filter(a => a.playerId === player.id && (a.action === 'bet' || a.action === 'raise' || a.action === 'call'))
        .reduce((sum, a) => sum + (a.amount || 0), 0);
      if (betInRound < currentBet) return false;
    }
    return true;
  };

  // Check if betting round is over and progress phase (after any action)
  useEffect(() => {
    // Skip if game is complete or pre-deal
    if (gamePhase === GamePhase.HAND_COMPLETE || gamePhase === GamePhase.PRE_DEAL) return;
    
    if (isBettingRoundOver(currentGameState) && !isAITurn(currentGameState)) {
      const progressed = progressGamePhase(currentGameState);
      updateState(progressed);
    }
  }, [currentGameState, gamePhase, updateState]);

  // Drive AI turns sequentially
  const aiBusyRef = useRef(false);
  useEffect(() => {
    if (aiBusyRef.current) return;
    // Don't start AI turns if hand is still starting (announcements in progress)
    if (isHandStarting) return;
    // If it's an AI turn, execute it. If user chose Skip, auto-play consecutively.
    if (isAITurn(currentGameState) || isAutoPlaying) {
      aiBusyRef.current = true;
      const currentPlayer = getCurrentPlayer(currentGameState);
      const playerIndex = currentGameState.bettingState.currentPlayerIndex;
      (async () => {
        try {
          const decision = await executeAITurn(currentPlayer!, currentGameState, playerIndex);
          // Apply decision via store
          if (decision.action === 'fold') playerFold(currentPlayer!.id);
          if (decision.action === 'check') playerCheck(currentPlayer!.id);
          if (decision.action === 'call') playerCall(currentPlayer!.id);
          if (decision.action === 'raise' && typeof decision.amount === 'number') {
            playerRaise(currentPlayer!.id, decision.amount);
          }
          // After action, if round over, progress phase
          const latestState: GameState = {
            players: useGameStore.getState().players,
            deck: useGameStore.getState().deck,
            communityCards: useGameStore.getState().communityCards,
            pot: useGameStore.getState().pot,
            gamePhase: useGameStore.getState().gamePhase,
            bettingState: useGameStore.getState().bettingState,
            dealerIndex: useGameStore.getState().dealerIndex,
            winningHandType: useGameStore.getState().winningHandType,
            lastWinner: useGameStore.getState().lastWinner,
            lastWinningHandType: useGameStore.getState().lastWinningHandType,
            cyclesBalance: useGameStore.getState().cyclesBalance,
            handsCompleted: useGameStore.getState().handsCompleted,
          };
          if (isBettingRoundOver(latestState)) {
            const progressed = progressGamePhase(latestState);
            updateState(progressed);
            // Stop autoplay at the end of the round
            setAutoPlaying(false);
          } else if (isAutoPlaying && isAITurn(useGameStore.getState())) {
            // keep autoplaying; the state update above will retrigger this effect
          }
        } finally {
          aiBusyRef.current = false;
        }
      })();
    }
  }, [currentGameState, updateState, playerFold, playerCall, playerRaise, playerCheck, isAutoPlaying, setAutoPlaying, isHandStarting, players, bettingState]);

  // Coaching integration
  const { messages, isLoading, isAutoAdviceLoading, latestAdvice, requestAdvice, sendMessage } = useCoaching(currentGameState);

  const isUserTurn = computeIsUserTurn(currentGameState);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleGetAdvice = () => {
    requestAdvice();
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="relative flex h-screen w-full flex-col bg-[#0F1B2E] overflow-hidden">
          <Header />
          <main className="flex-1 flex flex-col items-center p-4 xl:p-6 gap-4 xl:gap-6 overflow-auto">
            <div className="w-full max-w-7xl flex flex-col gap-6 min-h-0">
              <GameInfoPanel />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 items-start min-h-0">
                {/* AI Coach and Actions (left on large screens) */}
                <div className="order-2 lg:order-1 h-full min-h-0 flex flex-col gap-4">
                  <AIAssistant
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onGetAdvice={handleGetAdvice}
                    isLoading={isLoading}
                    isUserTurn={isUserTurn}
                    isAutoAdviceLoading={isAutoAdviceLoading}
                    latestAdvice={latestAdvice}
                  />
                  {/* Player Actions under coach */}
                  <div className="w-full flex items-center justify-center">
                    <ActionControls />
                  </div>
                </div>

                {/* Table */}
                <div className="order-1 lg:order-2 lg:col-span-2 min-h-0">
                  <PokerTable />
                </div>
              </div>

              {/* Action Controls moved under coach to free bottom space */}
            </div>
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
