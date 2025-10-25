# Poker Trainer MVP Requirements

## Executive Summary

This document outlines the Minimum Viable Product (MVP) requirements for launching a functional poker trainer application. The MVP focuses on delivering core gameplay mechanics, basic AI opponents, and an AI coaching feature that provides meaningful learning experiences for new poker players.

## MVP Goal

Create a simple, functional single-player poker trainer where users can:
- Play complete hands of No-Limit Texas Hold'em against AI opponents
- Receive real-time coaching advice from an AI coach
- Learn poker fundamentals through practical gameplay

## Core MVP Features (Must-Have)

### 1. Essential Game Logic

#### 1.1 Game State Management
Implement a centralized state management system using React's `useReducer` or Zustand:

**Required State Properties:**
- `players`: Array of 4-6 players (1 human + 3-5 AI opponents)
  - Each player: `{ id, name, chips, cards[], isFolded, currentBet, position }`
- `deck`: Card array (managed internally, not displayed)
- `communityCards`: Array of 0-5 cards
- `pot`: Total pot amount (number)
- `currentBet`: Minimum bet to call (number)
- `currentPlayerIndex`: Index of active player
- `gamePhase`: Enum: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handComplete'
- `dealerPosition`: Index (0-5)
- `smallBlindPosition`: Index
- `bigBlindPosition`: Index

#### 1.2 Core Game Flow Engine

**Phase 1: Hand Initialization**
- Shuffle deck (52 cards)
- Move dealer button clockwise
- Post small blind (10 chips) and big blind (20 chips)
- Deal 2 cards to each player
- Set gamePhase to 'preflop'

**Phase 2: Betting Rounds**
- Start with player after big blind (preflop) or dealer+1 (post-flop)
- Each player in sequence can: Fold, Call, Raise, or Check (if no bet)
- Round ends when all active players have matched the current bet
- Progress through phases: preflop → flop (3 cards) → turn (1 card) → river (1 card) → showdown

**Phase 3: Winner Determination**
- Implement basic hand evaluation:
  - High Card
  - One Pair
  - Two Pair
  - Three of a Kind
  - Straight
  - Flush
  - Full House
  - Four of a Kind
  - Straight Flush
- Award pot to winner(s)
- Display winning hand

**Phase 4: Hand Completion**
- Show "New Hand" button
- Reset table (collect cards, reset bets, update chip counts)
- Eliminate players with 0 chips
- Add new AI player if table drops below 4 players

### 2. Basic AI Opponents

**MVP AI Strategy (Rule-Based):**

Implement a simple but believable AI using pre-flop hand strength categories:

**Tier 1 (Strong):** AA, KK, QQ, AKs
- Preflop: Raise 3x BB
- Post-flop: Bet/raise 50-75% pot with top pair or better

**Tier 2 (Playable):** JJ, TT, AK, AQ, KQ
- Preflop: Call or raise 2x BB from late position
- Post-flop: Call with draws or medium pairs

**Tier 3 (Weak):** Everything else
- Preflop: Fold unless in big blind
- Post-flop: Fold to any bet

**Position Awareness:**
- Early position (first 2 seats): Play only Tier 1 hands
- Middle position: Play Tier 1-2 hands
- Late position (dealer, dealer-1): Play Tier 1-3 hands with aggression

**Randomization:**
- Add 20% variance to decisions to prevent predictability
- Occasionally bluff (10% of the time with nothing)

### 3. AI Coach Integration

#### 3.1 When to Trigger Coaching

**Automatic Coaching Moments:**
- User's turn to act (provide suggestion)
- User makes a decision (provide brief feedback if suboptimal)

**Manual Coaching:**
- "Get Advice" button always available
- Chat interface for specific questions

#### 3.2 Coaching Prompt Structure

Enhance the existing `geminiService.ts` prompt with:

```typescript
const prompt = `You are a poker coach helping a beginner learn Texas Hold'em.

CURRENT SITUATION:
- Your hand: ${userHand}
- Community cards: ${communityCards}
- Pot size: ${pot} chips
- To call: ${toCall} chips
- Your chips: ${userChips}
- Your position: ${position}
- Phase: ${gamePhase}
- Active players: ${activePlayers}

PLAYER ACTIONS THIS ROUND:
${recentActions}

TASK: Provide a clear, concise suggestion (2-3 sentences):
1. What action to take (Fold/Call/Raise)
2. Why (brief reasoning based on hand strength, pot odds, or position)

Keep advice simple and educational for beginners.`;
```

#### 3.3 Coach Display

**UI Requirements:**
- Side panel showing AI coach avatar and message
- Latest advice always visible
- "Show explanation" button for detailed reasoning
- Chat history for context (last 5 messages)

### 4. User Interface Essentials

#### 4.1 Critical UI Components

**PokerTable Display:**
- 6 player positions arranged in oval
- Community cards centered
- Pot amount displayed prominently
- Dealer button indicator
- Small blind/big blind markers

**Player Component:**
- Avatar/placeholder image
- Name and chip count
- Card visibility (face-up for user, face-down for others until showdown)
- "Folded" visual indicator (greyed out)
- Current bet amount

**ActionControls:**
- Buttons: Fold, Check/Call (dynamic label), Raise
- Raise amount slider (min: current bet + 20, max: user's chips)
- Display: "To call: X chips"
- Disable controls when not user's turn
- Clear visual feedback for selected action

**Game Information Panel:**
- Current pot
- Current phase (Preflop/Flop/Turn/River)
- Your hand strength hint (e.g., "Pair of Kings")

#### 4.2 Essential Feedback

**Action Feedback:**
- Toast notifications for actions: "John calls 40 chips", "Sarah folds"
- Highlight current active player
- Smooth transitions between phases

**Hand Completion:**
- Show all player cards at showdown
- Highlight winning hand
- Display winning hand type (e.g., "Full House, Kings over Tens")
- "Next Hand" button

### 5. Game Flow Implementation

#### 5.1 Single Hand Flow

```
1. Initialize Hand
   ↓
2. Betting Round (Preflop)
   - AI Coach provides advice on user's turn
   ↓
3. Deal Flop (3 cards)
   ↓
4. Betting Round
   ↓
5. Deal Turn (1 card)
   ↓
6. Betting Round
   ↓
7. Deal River (1 card)
   ↓
8. Final Betting Round
   ↓
9. Showdown (determine winner)
   ↓
10. Display Results
   ↓
11. Wait for "Next Hand" button
```

#### 5.2 Starting Configuration

**Initial Setup:**
- 5 total players (user + 4 AI)
- Starting chips: 1000 per player
- Small blind: 10
- Big blind: 20
- User starts in middle position

## Features Explicitly EXCLUDED from MVP

To maintain focus and accelerate launch, exclude these features:

❌ **Post-hand analysis/review** - Add in v1.1
❌ **Hand history tracking** - Add in v1.1
❌ **Multiple table stakes (blinds)** - MVP uses fixed blinds
❌ **Statistics tracking** - Add in v1.2
❌ **Advanced AI strategies** - Keep AI simple and rule-based
❌ **Tournament mode** - Cash game only for MVP
❌ **Multiplayer** - Single player only
❌ **User accounts/authentication** - Local play only
❌ **Customizable avatars** - Use placeholder images
❌ **Sound effects** - Visual feedback only
❌ **Mobile optimization** - Desktop-first (responsive is nice-to-have)
❌ **All-in side pot calculations** - Simplified pot management
❌ **Split pot scenarios** - Single winner only for MVP

## Technical Implementation Priority

### Phase 1 (Week 1-2): Core Game Engine
1. Implement game state management with useReducer
2. Build deck shuffling and card dealing
3. Create betting round logic
4. Implement basic hand evaluation (use existing library if possible: `poker-hand-evaluator` or similar)

### Phase 2 (Week 2-3): AI Opponents
1. Implement rule-based AI decision making
2. Add position awareness
3. Test AI behavior across multiple hands

### Phase 3 (Week 3-4): Coach Integration
1. Enhance Gemini prompts with game context
2. Wire coach to user's turn
3. Add coaching UI panel

### Phase 4 (Week 4-5): UI Polish & Flow
1. Connect all components to live game state
2. Implement action controls with validation
3. Add visual feedback and transitions
4. Create "New Hand" flow

### Phase 5 (Week 5-6): Testing & Launch Prep
1. Playtest 50+ hands
2. Fix critical bugs
3. Add basic error handling
4. Write simple user guide
5. Deploy

## Success Metrics for MVP

**Launch Readiness Criteria:**
- [ ] User can play 10 consecutive hands without errors
- [ ] AI opponents make reasonable decisions 90% of the time
- [ ] Coach provides relevant advice on every user turn
- [ ] All hand types are correctly evaluated
- [ ] Winner determination is accurate 100% of the time
- [ ] UI clearly communicates game state
- [ ] "New Hand" successfully resets game

**User Experience Goals:**
- Average hand completion time: 2-3 minutes
- User understands what action to take within 10 seconds
- Coach advice is comprehensible to poker beginners
- Zero crashes during normal gameplay

## Recommended Technology Additions

For MVP implementation:

1. **State Management:** Zustand (simpler than Redux for this scope)
2. **Hand Evaluation:** `poker-tools` or `pokersolver` npm package
3. **Card Assets:** Use a free card deck sprite sheet (e.g., from OpenGameArt)
4. **Animations:** Framer Motion (optional, for smoother transitions)

## Next Steps

1. Review and approve this MVP scope
2. Set up development environment with recommended packages
3. Create development branch
4. Begin Phase 1 implementation with game state management
5. Weekly check-ins to track progress against timeline

## Post-MVP Roadmap (v1.1+)

**Version 1.1 (Post-Launch):**
- Hand history and review feature
- Post-hand analysis from AI coach
- Basic statistics (hands played, win rate)

**Version 1.2:**
- Tutorial mode for complete beginners
- Multiple blind levels
- Achievement system

**Version 2.0:**
- User accounts and cloud save
- Tournament mode
- More sophisticated AI using GTO principles

---

*This MVP is designed to be completable in 5-6 weeks by a single developer with React experience and is focused on delivering a functional, educational poker experience.*
