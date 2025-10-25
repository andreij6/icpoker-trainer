
import { GoogleGenAI } from "@google/genai";
import { GameState, Player, Card } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
/**
 * Formats a card object into a human-readable string.
 * @param card The card to format.
 * @returns A string representation of the card (e.g., "Ace of spades").
 */
function formatCard(card: Card): string {
  return `${card.rank} of ${card.suit.toLowerCase()}`;
}

/**
 * Gets a poker coaching suggestion from the Gemini AI based on the current game state and user query.
 *
 * This function constructs a detailed prompt with information about the pot size, community cards,
 * the user's hand and stack, and the number of active opponents. It then sends this prompt to the
 * Gemini API and returns the AI's response.
 *
 * @param gameState The current state of the poker game.
 * @param userQuery The question or action from the user.
 * @returns A promise that resolves to the AI's coaching suggestion as a string.
 */
export async function getAICoachSuggestion(gameState: GameState, userQuery: string): Promise<string> {
  const userPlayer = gameState.players.find(p => p.isYou);
  if (!userPlayer) {
    return "Error: User player not found.";
  }

  const activeOpponents = gameState.players.filter(p => !p.isYou && p.status === 'ACTIVE');

  const prompt = `
    You are an expert Texas Hold'em poker tournament coach. Analyze the following hand situation and provide strategic advice. Be concise and clear.

    Game State:
    - Pot Size: $${gameState.pot.toLocaleString()}
    - Community Cards (Board): ${gameState.communityCards.map(formatCard).join(', ')}

    Your Situation:
    - Your Hand: ${userPlayer.cards ? `${formatCard(userPlayer.cards[0])} and ${formatCard(userPlayer.cards[1])}` : 'Unknown'}
    - Your Stack: $${userPlayer.stack.toLocaleString()}

    Opponent Information:
    - There are ${activeOpponents.length} active opponents.
    ${activeOpponents.map(p => `- ${p.name} has a stack of $${p.stack.toLocaleString()}`).join('\n')}

    User's Question: "${userQuery}"

    Based on all this information, provide your expert coaching advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching suggestion from Gemini API:", error);
    return "Sorry, I couldn't process that request. Please check your API key and try again.";
  }
}
