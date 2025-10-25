
import { GoogleGenAI } from "@google/genai";
import { GameState, Player, Card } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatCard(card: Card): string {
  return `${card.rank} of ${card.suit.toLowerCase()}`;
}

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
