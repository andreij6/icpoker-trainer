# Poker Trainer Application Enhancement Plan

## Introduction

This document outlines the necessary features and implementation steps to transform the existing codebase into a simple, functional poker trainer application. The goal is to allow a player to play multiple hands of poker against AI opponents while receiving guidance and learning from an AI coach.

## 1. Core Game Logic Implementation

The foundation of the poker trainer is a robust game engine that accurately simulates a game of No-Limit Texas Hold'em.

### 1.1. Game State Management

-   **Implement a central game state:** Create a state management structure (e.g., using React's `useReducer` or a state management library like Zustand) to hold all game-related data:
    -   `players`: An array of player objects (including the human player and AI opponents) with their chip stacks, cards, and status.
    -   `deck`: The current deck of cards.
    -   `communityCards`: The cards on the flop, turn, and river.
    -   `pot`: The total amount of chips in the pot.
    -   `currentTurn`: The index of the player whose turn it is to act.
    -   `gamePhase`: The current phase of the game (e.g., `pre-flop`, `flop`, `turn`, `river`, `showdown`).
    -   `dealerPosition`: The position of the dealer button.

### 1.2. Game Flow Engine

-   **Develop a game flow engine:** This engine will control the sequence of the game based on the rules of Texas Hold'em.
    -   **Dealing:** Implement functions to shuffle the deck and deal cards to players.
    -   **Betting Rounds:** Create a loop that manages the betting rounds for each phase of the game. It should handle player actions (bet, call, raise, fold, check) and update the game state accordingly.
    -   **Winner Determination:** Implement logic to determine the winning hand at showdown or when all other players fold. This will involve hand evaluation logic (e.g., identifying pairs, straights, flushes).

## 2. AI Opponent Logic

To make the game realistic, the AI opponents need to have a basic level of intelligence.

-   **Simple AI Decision Making:** Implement a function that determines the AI opponents' actions. This can be based on a simple set of rules, such as:
    -   Hand strength (e.g., fold weak hands, bet strong hands).
    -   Position at the table.
    -   The actions of other players.

## 3. AI Coach Integration

The AI coach is the core learning component of the application. It will use the Gemini API to provide real-time advice.

### 3.1. Real-time Advice

-   **Prompt Engineering:** Design prompts for the `geminiService` that send the current game state (player's cards, community cards, pot size, player actions) to the Gemini API.
-   **Displaying Advice:** The `AIAssistant` component should display the advice received from the Gemini API in a clear and understandable way. The advice should explain the reasoning behind the suggested action (e.g., "You should call because you have good pot odds to draw to a flush.").

### 3.2. Post-Hand Analysis

-   **Hand History:** Store the history of actions for each hand.
-   **Review and Feedback:** After a hand is complete, the AI coach can provide a summary of the player's key decisions and offer suggestions for improvement.

## 4. User Interface Enhancements

The UI needs to be intuitive and provide all the necessary information to the player.

-   **Connect UI to Game State:** The `PokerTable`, `Player`, and `PlayingCard` components should be connected to the central game state to display the current situation accurately.
-   **Action Controls:** The `ActionControls` component should be enabled/disabled based on the current turn and allow the player to submit their chosen action. The component should also include controls for setting the bet/raise amount.

## 5. Game Flow and Multiple Hand Support

The application should allow the player to play continuously.

-   **New Hand:** Implement a "new hand" button or automatically start a new hand after the previous one is finished.
-   **Resetting the Game State:** Create a function to reset the game state for a new hand (e.g., collect cards, move the dealer button, post blinds).

By implementing these features, the application will become a valuable tool for new poker players to learn the game and improve their skills in a safe and interactive environment.
