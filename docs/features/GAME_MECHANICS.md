# Game Mechanics

## Overview
ICPoker Trainer is a Texas Hold'em No Limit poker training application that simulates realistic poker gameplay with AI opponents. The game follows standard poker rules with custom enhancements for training purposes.

## Table of Contents
- [Game Structure](#game-structure)
- [Betting Rounds](#betting-rounds)
- [Game Phases](#game-phases)
- [Player Actions](#player-actions)
- [Pot Management](#pot-management)
- [Hand Evaluation](#hand-evaluation)
- [Game Flow](#game-flow)

## Game Structure

### Table Configuration
- **Maximum Players**: 9 players (1 human + 8 AI)
- **Minimum Players**: 2 players (heads-up)
- **Starting Stack**: $2,500 per player
- **Blind Structure**: 
  - Small Blind: $25
  - Big Blind: $50
- **Game Type**: No Limit Texas Hold'em

### Seating Arrangement
- **Linear Layout**: Players displayed in a horizontal row
- **User Position**: Always leftmost (Seat 1)
- **Dynamic Ordering**: Active players shown first, folded players moved to end
- **Seat Numbers**: Each player has a fixed seat number (1-9)
- **Position Indicators**: Dealer button, Small Blind (SB), Big Blind (BB) badges

## Betting Rounds

### Round Structure
Each hand consists of up to four betting rounds:

1. **Pre-Flop**
   - After hole cards are dealt
   - Action starts with player after Big Blind (Under the Gun - UTG)
   - Players can fold, call, or raise

2. **Flop**
   - After first 3 community cards are revealed
   - Action starts with first active player after dealer button
   - Players can check, bet, call, raise, or fold

3. **Turn**
   - After 4th community card is revealed
   - Same action rules as flop

4. **River**
   - After 5th community card is revealed
   - Final betting round
   - Same action rules as turn

### Betting Round Completion
A betting round ends when:
- All active players have acted
- All active players have either:
  - Matched the current bet, OR
  - Gone all-in, OR
  - Folded
- No pending raises remain

### Special Cases
- **Heads-Up Pre-Flop**: Small blind acts first, big blind acts second
- **All-In Players**: Cannot act further but remain eligible for pot
- **Single Active Player**: Hand ends immediately, player wins pot

## Game Phases

### Phase Progression

```
PRE_DEAL → PREFLOP → FLOP → TURN → RIVER → SHOWDOWN → HAND_COMPLETE
```

### Phase Details

#### PRE_DEAL
- Initial state before cards are dealt
- Players posted blinds
- Deck is shuffled
- Dealer button positioned

#### PREFLOP
- Hole cards dealt to all players
- First betting round
- Action starts UTG (Under the Gun)
- Players evaluate starting hands

#### FLOP
- First 3 community cards revealed
- Second betting round
- Action starts with first active player after button
- Players can now make pairs, draws, etc.

#### TURN
- 4th community card revealed
- Third betting round
- Pot typically larger, decisions more critical
- Drawing hands evaluate outs

#### RIVER
- 5th and final community card revealed
- Final betting round
- Last chance to improve hand
- Showdown imminent if multiple players remain

#### SHOWDOWN
- Occurs when 2+ players remain after river betting
- Players reveal hole cards
- Best 5-card hand wins
- Pot awarded to winner(s)

#### HAND_COMPLETE
- Hand has concluded
- Winner determined and pot awarded
- Brief display of results
- Automatic advance to next hand after 3 seconds

## Player Actions

### Available Actions

#### Fold
- **When Available**: Any time it's player's turn
- **Effect**: Player forfeits hand, loses any chips already bet
- **Irreversible**: Cannot rejoin current hand
- **Display**: Player card grayed out, moved to end of row

#### Check
- **When Available**: When no bet has been made in current round
- **Effect**: Pass action to next player without betting
- **Cost**: Free (0 chips)
- **Strategic Use**: See next card without investing chips

#### Call
- **When Available**: When a bet has been made
- **Effect**: Match the current bet amount
- **Cost**: Difference between current bet and player's bet in round
- **All-In**: If call amount exceeds stack, player goes all-in

#### Bet
- **When Available**: When no bet has been made in current round
- **Effect**: Put chips into pot, forcing others to match or fold
- **Minimum**: $50 (Big Blind)
- **Maximum**: Player's entire stack (all-in)

#### Raise
- **When Available**: When a bet has been made
- **Effect**: Increase the current bet, forcing others to match new amount
- **Minimum**: Current bet + $50 (one big blind increment)
- **Maximum**: Player's entire stack (all-in)
- **Sizing Options**:
  - Custom amount (slider)
  - 1/2 Pot
  - Pot
  - All-In

### Action Timing
- **User Actions**: Immediate when it's user's turn
- **AI Actions**: 
  - Pre-Flop: 1 second delay
  - Flop: 1.5 second delay
  - Turn: 2 second delay
  - River: 2 second delay

### Action Validation
- Stack size checked before action
- Minimum raise enforced
- All-in detection automatic
- Invalid actions prevented by UI

## Pot Management

### Main Pot
- Contains chips from all active players
- Awarded to winner at showdown
- Displayed prominently above community cards

### Side Pots
- Created when players go all-in for different amounts
- Multiple side pots possible
- Each pot has eligible players list
- Calculated automatically
- Displayed separately when present

### Side Pot Logic
When players go all-in for different amounts:

1. **Contributions Tracked**: Each player's total bet recorded
2. **Pots Created**: Separate pot for each all-in amount
3. **Eligibility Determined**: Players eligible for pots up to their contribution
4. **Distribution**: Each pot awarded to best hand among eligible players

**Example**:
```
Player A: All-in $100
Player B: All-in $200  
Player C: Calls $200

Main Pot: $300 (3 × $100) - All players eligible
Side Pot: $200 (2 × $100) - Only B and C eligible
```

### Pot Display
- **Main Pot**: Always shown
- **Side Pots**: Listed as "Side 1", "Side 2", etc.
- **Real-Time Updates**: Pot grows as bets are made
- **Color Coding**: Yellow for side pots

## Hand Evaluation

### Hand Rankings (Highest to Lowest)

1. **Royal Flush**
   - A, K, Q, J, 10 of same suit
   - Unbeatable hand
   - Example: A♠ K♠ Q♠ J♠ 10♠

2. **Straight Flush**
   - Five consecutive cards of same suit
   - Example: 9♥ 8♥ 7♥ 6♥ 5♥

3. **Four of a Kind**
   - Four cards of same rank
   - Example: K♠ K♥ K♦ K♣ 5♠

4. **Full House**
   - Three of a kind + pair
   - Example: Q♠ Q♥ Q♦ 3♠ 3♥

5. **Flush**
   - Five cards of same suit
   - Example: A♦ J♦ 9♦ 6♦ 2♦

6. **Straight**
   - Five consecutive cards
   - Example: 10♠ 9♥ 8♦ 7♣ 6♠

7. **Three of a Kind**
   - Three cards of same rank
   - Example: 8♠ 8♥ 8♦ A♠ K♥

8. **Two Pair**
   - Two different pairs
   - Example: A♠ A♥ 7♦ 7♣ K♠

9. **Pair**
   - Two cards of same rank
   - Example: J♠ J♥ 9♦ 6♣ 2♠

10. **High Card**
    - No matching cards
    - Example: A♠ K♥ 10♦ 7♣ 3♠

### Evaluation System
- **Library**: pokersolver (with custom Royal Flush detection)
- **Best 5 Cards**: Automatically selected from 7 available (2 hole + 5 community)
- **Tie Breaking**: Kickers used when hands tie
- **Display**: Full hand description shown (e.g., "Flush, Ace High")

## Game Flow

### Hand Lifecycle

```
1. New Hand Started
   ↓
2. Blinds Posted (SB, BB)
   ↓
3. Cards Dealt (2 to each player)
   ↓
4. Pre-Flop Betting
   ↓
5. Flop Revealed (if 2+ players)
   ↓
6. Flop Betting
   ↓
7. Turn Revealed (if 2+ players)
   ↓
8. Turn Betting
   ↓
9. River Revealed (if 2+ players)
   ↓
10. River Betting
    ↓
11. Showdown (if 2+ players)
    ↓
12. Pot Awarded
    ↓
13. Hand Complete (3 second display)
    ↓
14. Next Hand (automatic or manual)
```

### Dealer Button Movement
- Moves clockwise after each hand
- Skips eliminated players
- Determines blind positions
- Affects action order post-flop

### Action Order

**Pre-Flop**:
- UTG (first after BB) acts first
- Action proceeds clockwise
- BB acts last (has option to raise)

**Post-Flop** (Flop, Turn, River):
- First active player after button acts first
- Action proceeds clockwise
- Last aggressor acts last

### Early Hand Termination
Hand ends early if:
- All but one player folds → Remaining player wins
- All but one player is all-in → Run out remaining cards
- Player goes all-in and is called → Showdown

### Winner Determination
1. **Single Player Remaining**: Wins by default (no showdown)
2. **Multiple Players at Showdown**: Best hand wins
3. **Tied Hands**: Pot split equally
4. **Side Pots**: Each pot awarded separately

### Elimination
- Player eliminated when stack reaches $0
- Eliminated players cannot rejoin
- Game continues with remaining players
- Minimum 2 players required

## Advanced Features

### Skip to Next Hand
- Available when not user's turn
- Immediately ends current hand
- No showdown displayed
- Starts new hand instantly
- Useful for training efficiency

### Auto-Advance
- After hand completes, 3-second countdown
- "Next Hand" button available
- Automatic progression if button not clicked
- Allows time to review results

### Position Awareness
- System tracks and announces user position
- Special positions called out:
  - Button
  - Small Blind
  - Big Blind
  - Under the Gun (UTG)
  - UTG+1
  - Cutoff
  - Middle Position

### Hand History
- Last winner displayed in Game Info Panel
- Winning hand type shown
- Action history in AI Coach panel
- All player actions logged

## Technical Implementation

### State Management
- **Zustand Store**: Centralized game state
- **Real-Time Updates**: Immediate UI reflection
- **Action Validation**: Server-side style validation
- **Immutable Updates**: State never mutated directly

### Game Actions Module
Core functions in `gameActions.ts`:
- `fold()`: Handle fold action
- `call()`: Handle call action
- `raise()`: Handle raise action
- `check()`: Handle check action
- `startNewHand()`: Initialize new hand
- `endHand()`: Conclude hand, award pot
- `progressGamePhase()`: Advance to next phase
- `isBettingRoundOver()`: Check if round complete
- `calculateSidePots()`: Compute side pots

### Betting State
Tracks:
- `currentPlayerIndex`: Whose turn it is
- `currentBet`: Amount to match
- `lastRaiserIndex`: Who raised last
- `actions`: Array of all actions taken

### Error Handling
- Invalid actions prevented by UI
- Edge cases handled gracefully
- Error boundaries catch React errors
- Fallback UI for errors

## Future Enhancements

### Planned Features
- Tournament mode
- Adjustable blind levels
- Customizable starting stacks
- Hand replay system
- Statistics tracking
- Multi-table support
- Custom game rules

### Under Consideration
- Sit-and-go tournaments
- Time bank system
- Chat system
- Hand strength meter
- Pot odds calculator
- Range analysis tools

