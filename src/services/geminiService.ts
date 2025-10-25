
import { GoogleGenAI } from "@google/genai";
import { GameState, Player, Card, GamePhase, PlayerStatus } from '../types';
import { getPosition, isLatePosition } from '../utils/aiUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Formats a card object into a human-readable string.
 * @param card The card to format.
 * @returns A string representation of the card (e.g., "Ace of Spades").
 */
export function formatCard(card: Card): string {
  const rankNames: { [key: string]: string } = {
    'A': 'Ace',
    'K': 'King',
    'Q': 'Queen',
    'J': 'Jack',
    '10': 'Ten',
    '9': 'Nine',
    '8': 'Eight',
    '7': 'Seven',
    '6': 'Six',
    '5': 'Five',
    '4': 'Four',
    '3': 'Three',
    '2': 'Two'
  };

  const suitNames: { [key: string]: string } = {
    'SPADES': 'Spades',
    'HEARTS': 'Hearts',
    'CLUBS': 'Clubs',
    'DIAMONDS': 'Diamonds'
  };

  return `${rankNames[card.rank] || card.rank} of ${suitNames[card.suit] || card.suit}`;
}

/**
 * Formats the game phase into a human-readable string.
 * @param phase The game phase.
 * @returns A string representation of the phase.
 */
function formatGamePhase(phase: GamePhase): string {
  const phaseNames: { [key in GamePhase]: string } = {
    [GamePhase.PRE_DEAL]: 'Pre-deal',
    [GamePhase.PREFLOP]: 'Preflop (before the flop)',
    [GamePhase.FLOP]: 'Flop (3 community cards dealt)',
    [GamePhase.TURN]: 'Turn (4th community card dealt)',
    [GamePhase.RIVER]: 'River (all 5 community cards dealt)',
    [GamePhase.SHOWDOWN]: 'Showdown',
    [GamePhase.HAND_COMPLETE]: 'Hand complete'
  };

  return phaseNames[phase] || phase;
}

/**
 * Formats the player's position into a human-readable string.
 * @param playerIndex The player's index.
 * @param dealerIndex The dealer button index.
 * @param totalPlayers Total number of players.
 * @returns A string describing the position (e.g., "Late position (advantageous)").
 */
function formatPosition(playerIndex: number, dealerIndex: number, totalPlayers: number): string {
  const position = getPosition(playerIndex, dealerIndex, totalPlayers);
  
  const positionDescriptions: { [key: string]: string } = {
    'SB': 'Small Blind (will act first after the flop)',
    'BB': 'Big Blind (last to act preflop)',
    'UTG': 'Early Position - Under the Gun (first to act)',
    'EP': 'Early Position (early to act, disadvantageous)',
    'MP': 'Middle Position (neutral)',
    'LP': 'Late Position (late to act, advantageous)',
    'BTN': 'Button/Dealer (best position, acts last)'
  };

  return positionDescriptions[position] || position;
}

/**
 * Calculates pot odds as a ratio.
 * @param potSize Current pot size.
 * @param costToCall Amount needed to call.
 * @returns A string representing pot odds (e.g., "3:1").
 */
function calculatePotOdds(potSize: number, costToCall: number): string {
  if (costToCall === 0) {
    return 'N/A (no bet to call)';
  }
  
  const ratio = potSize / costToCall;
  return `${ratio.toFixed(1)}:1 (you're risking ${costToCall} to win ${potSize})`;
}

/**
 * Formats recent actions into a readable summary.
 * @param actions Recent betting actions.
 * @param players All players in the game.
 * @returns A string summarizing recent actions.
 */
function formatRecentActions(
  actions: Array<{ playerId: number; action: string; amount?: number }>,
  players: Player[]
): string {
  if (actions.length === 0) {
    return 'No actions yet this round.';
  }

  const recentActions = actions.slice(-5); // Last 5 actions
  return recentActions.map(action => {
    const player = players.find(p => p.id === action.playerId);
    const playerName = player?.name || `Player ${action.playerId}`;
    
    if (action.action === 'fold') {
      return `${playerName} folded`;
    } else if (action.action === 'check') {
      return `${playerName} checked`;
    } else if (action.action === 'call') {
      return `${playerName} called ${action.amount || 0}`;
    } else if (action.action === 'raise' || action.action === 'bet') {
      return `${playerName} raised to ${action.amount || 0}`;
    }
    return `${playerName} ${action.action}`;
  }).join(', ');
}

/**
 * Formats the complete game context into a readable string for the Gemini API.
 * 
 * This function extracts and formats all relevant game information including:
 * - User's hole cards and chip count
 * - Community cards (for current phase)
 * - Pot size and pot odds
 * - Player position
 * - Recent opponent actions
 * - Current game phase
 * 
 * @param gameState The current game state.
 * @returns A formatted string with complete game context.
 */
export function formatGameContext(gameState: GameState): string {
  const userPlayer = gameState.players.find(p => p.isYou);
  
  if (!userPlayer) {
    return 'Error: User player not found in game state.';
  }

  const activePlayers = gameState.players.filter(
    p => p.status === PlayerStatus.Active && !p.isEliminated
  );
  const activeOpponents = activePlayers.filter(p => !p.isYou);
  
  // Calculate cost to call
  const currentBet = gameState.bettingState.currentBet;
  const userCurrentBet = gameState.bettingState.actions
    .filter(a => a.playerId === userPlayer.id)
    .reduce((sum, a) => sum + (a.amount || 0), 0);
  const costToCall = Math.max(0, currentBet - userCurrentBet);

  let context = '**CURRENT GAME SITUATION**\n\n';
  
  // Game Phase
  context += `**Game Phase:** ${formatGamePhase(gameState.gamePhase)}\n\n`;
  
  // User's cards
  if (userPlayer.cards && userPlayer.cards.length === 2) {
    context += `**Your Hand:** ${formatCard(userPlayer.cards[0])} and ${formatCard(userPlayer.cards[1])}\n`;
  } else {
    context += `**Your Hand:** (cards not dealt yet)\n`;
  }
  
  // Community cards
  if (gameState.communityCards.length > 0) {
    context += `**Community Cards (Board):** ${gameState.communityCards.map(formatCard).join(', ')}\n`;
  } else {
    context += `**Community Cards:** None dealt yet (preflop)\n`;
  }
  
  context += '\n**POT & BETTING INFO**\n';
  context += `- Current Pot: ${gameState.pot} chips\n`;
  context += `- Current Bet: ${currentBet} chips\n`;
  
  if (costToCall > 0) {
    context += `- Cost to Call: ${costToCall} chips\n`;
    context += `- Pot Odds: ${calculatePotOdds(gameState.pot, costToCall)}\n`;
  } else {
    context += `- Cost to Call: 0 chips (no bet, you can check)\n`;
  }
  
  context += '\n**YOUR SITUATION**\n';
  context += `- Your Chip Stack: ${userPlayer.stack} chips\n`;
  context += `- Your Position: ${formatPosition(gameState.players.indexOf(userPlayer), gameState.dealerIndex, gameState.players.length)}\n`;
  
  context += '\n**OPPONENT INFORMATION**\n';
  context += `- Active Opponents: ${activeOpponents.length}\n`;
  activeOpponents.forEach(opponent => {
    const oppStatus = opponent.status === PlayerStatus.Folded ? ' (folded)' : '';
    context += `  - ${opponent.name}: ${opponent.stack} chips${oppStatus}\n`;
  });
  
  // Recent actions
  if (gameState.bettingState.actions.length > 0) {
    context += '\n**RECENT ACTIONS THIS ROUND:**\n';
    context += formatRecentActions(gameState.bettingState.actions, gameState.players) + '\n';
  }
  
  return context;
}

/**
 * Gets automatic coaching advice for the current game situation.
 * 
 * This function is called automatically when it becomes the user's turn.
 * It provides strategic advice on what action to take (fold/call/raise).
 * 
 * @param gameState The current state of the poker game.
 * @returns A promise that resolves to the coach's advice as a string.
 */
export async function getAutomaticCoaching(gameState: GameState): Promise<string> {
  const context = formatGameContext(gameState);
  
  const prompt = `${context}

**YOUR ROLE:** You are an expert Texas Hold'em poker coach helping a beginner player. Based on the game situation above, provide clear, concise strategic advice.

**INSTRUCTIONS:**
1. Give a specific action recommendation: Should they FOLD, CHECK/CALL, or RAISE?
2. Explain your reasoning in 2-3 sentences maximum
3. Consider position, pot odds, hand strength, and opponent actions
4. Use simple language suitable for poker beginners
5. Be encouraging but honest about the situation

Provide your coaching advice now:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching automatic coaching from Gemini API:", error);
    return "Coach is temporarily unavailable. Make your best decision based on your hand strength and position.";
  }
}

/**
 * Gets a poker coaching suggestion from the Gemini AI based on a user's question.
 * 
 * This function is called when the user manually asks a question in the chat.
 * It includes the full game context along with the user's specific question.
 * 
 * @param gameState The current state of the poker game.
 * @param userQuery The user's question or request.
 * @returns A promise that resolves to the AI's response as a string.
 */
export async function getAICoachSuggestion(gameState: GameState, userQuery: string): Promise<string> {
  const context = formatGameContext(gameState);

  const prompt = `${context}

**USER'S QUESTION:** "${userQuery}"

**YOUR ROLE:** You are an expert Texas Hold'em poker coach. Answer the user's question clearly and concisely. Include game context when relevant. If they're asking for general poker advice, teach them the concept. If they're asking about their current situation, give specific strategic guidance.

Keep your response under 4 sentences for clarity.

Your response:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching suggestion from Gemini API:", error);
    return "Sorry, I couldn't process that request. Please check your internet connection and try again.";
  }
}

/**
 * Gets feedback on a user's action after they've made a decision.
 * 
 * This provides brief, constructive feedback on whether the user's
 * action was optimal given the game situation.
 * 
 * @param gameState The game state when the action was made.
 * @param action The action the user took (fold/call/raise).
 * @param amount The amount bet/raised (if applicable).
 * @returns A promise that resolves to feedback as a string.
 */
export async function getPostActionFeedback(
  gameState: GameState,
  action: string,
  amount?: number
): Promise<string> {
  const context = formatGameContext(gameState);
  
  const actionDescription = amount 
    ? `${action.toUpperCase()} ${amount} chips`
    : action.toUpperCase();

  const prompt = `${context}

**USER'S ACTION:** The player just chose to ${actionDescription}.

**YOUR ROLE:** Provide brief, constructive feedback on this decision. Was it optimal? If so, praise it. If not, gently suggest what might have been better and why.

Keep your feedback to ONE sentence - be encouraging and educational.

Your feedback:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching post-action feedback from Gemini API:", error);
    return "";
  }
}
