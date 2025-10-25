# Poker Trainer MVP - Complete Task List

## Phase 1: Core Game Engine (Week 1-2)

### [x] Task 1.1: Set Up State Management Architecture

**Description:**
Implement centralized state management using Zustand (or useReducer). Create the store with all required game state properties including players array, deck, community cards, pot, betting state, and game phase tracking.

**Success Criteria:**
- [x] Store is created and accessible throughout the application
- [x] All state properties defined in MVP spec are implemented
- [x] State can be updated from any component
- [ ] DevTools can inspect state changes (if using Zustand)
- [x] Initial state loads with 9 players (1 human + 8 AI) with 2500 chips each
- [x] Unit tests verify initial state (13 tests in gameStore.test.ts)

### [x] Task 1.2: Implement Deck Management

**Description:**
Create utility functions to generate a standard 52-card deck, shuffle it using Fisher-Yates algorithm, and deal cards. Include functions to reset and reshuffle the deck for new hands.

**Success Criteria:**
- [x] `createDeck()` generates all 52 cards with correct suits and ranks
- [x] `shuffleDeck()` randomizes card order
- [x] `dealCard()` removes and returns top card from deck
- [x] Deck cannot deal more than 52 cards
- [x] Deck can be reset and reshuffled for new hands
- [x] Unit tests verify shuffle randomness and dealing logic

### [x] Task 1.3: Build Hand Initialization Logic

**Description:**
Create the function that starts a new hand: moves dealer button, posts blinds, shuffles deck, deals 2 cards to each player, and sets game phase to preflop.

**Success Criteria:**
- [x] Dealer button moves clockwise each hand
- [x] Small blind (25 chips) and big blind (50 chips) are automatically posted
- [x] Each active player receives exactly 2 cards
- [x] User's cards are visible, AI cards are hidden
- [x] Game phase is set to 'preflop'
- [x] Current player is set to position after big blind
- [x] Players with 0 chips are marked as eliminated
- [x] Unit tests verify hand initialization (7 tests in gameActions.test.ts)

### [x] Task 1.4: Implement Betting Round Logic

**Description:**
Create the core betting round manager that handles player turns, validates actions (fold/call/raise/check), updates pot and player bets, and determines when a betting round is complete.

**Success Criteria:**
- [x] Players act in correct order (clockwise from current position)
- [x] Fold removes player from hand
- [x] Call matches current bet and deducts chips
- [x] Raise increases current bet and deducts chips
- [x] Check is only allowed when no bet is active
- [x] Round ends when all active players have matched current bet
- [x] Cannot bet more chips than player has
- [x] Pot is correctly calculated after each action
- [x] Action history is tracked for each round
- [x] Unit tests verify all betting actions (11 tests in gameActions.test.ts)

### [x] Task 1.5: Create Game Phase Progression

**Description:**
Implement the logic to transition between game phases (preflop → flop → turn → river → showdown) including dealing community cards at appropriate times and resetting betting state for new rounds.

**Success Criteria:**
- [x] Preflop transitions to flop after betting round completes
- [x] Flop deals 3 community cards
- [x] Turn deals 1 community card
- [x] River deals 1 community card
- [x] Each phase starts new betting round
- [x] If only one player remains, hand ends immediately
- [x] Betting action resets at start of each phase
- [x] Current player resets to first active player after dealer
- [x] Unit tests verify phase progression (7 tests in gameActions.test.ts)

### [x] Task 1.6: Integrate Hand Evaluation Library

**Description:**
Install and integrate a poker hand evaluation library (e.g., `pokersolver`, `poker-tools`). Create wrapper functions to evaluate player hands and determine winners.

**Success Criteria:**
- [x] Library is installed and imported correctly
- [x] `evaluateHand(cards, communityCards)` returns hand strength
- [x] All 10 hand rankings are correctly identified
- [x] `determineWinner(players, communityCards)` returns winning player
- [x] Ties are handled (highest kicker wins)
- [x] Function works with 0-5 community cards
- [x] Unit tests cover all hand type scenarios

### [x] Task 1.7: Build Winner Determination & Pot Award

**Description:**
Create the showdown logic that evaluates all active player hands, determines the winner(s), awards the pot, and updates chip counts. Display winning hand information.

**Success Criteria:**
- [x] All active players' hands are evaluated at showdown
- [x] Winner is correctly identified based on hand strength
- [x] Pot is awarded to winner
- [x] Winner's chip count increases by pot amount
- [x] Winning hand type is identified (e.g., "Flush, Ace high")
- [x] Game phase transitions to 'handComplete'
- [x] All player cards are revealed
- [x] Edge case: If all fold, last active player wins without showdown
- [x] Unit tests verify winner determination (4 tests in gameActions.test.ts)

### [x] Task 1.8: Create Hand Reset/New Hand Function

**Description:**
Implement the function that cleans up after a hand completes: collects all cards, resets bets, eliminates busted players, and prepares table for next hand without losing game history.

**Success Criteria:**
- [x] All cards are collected from players and community
- [x] Current bets are reset to 0
- [x] Pot is reset to 0
- [x] Players marked as folded are reset to active
- [x] Dealer button is ready to move on next hand
- [x] Players with 0 chips are marked as eliminated
- [x] If fewer than 4 players remain, new AI player is added with 2500 chips
- [x] User's chip count persists between hands
- [x] Unit tests verify hand reset (4 tests in gameActions.test.ts)

---

## Phase 2: AI Opponents (Week 2-3)

### [x] Task 2.1: Define Hand Strength Evaluation for AI

**Description:**
Create a function that categorizes starting hands into tiers (Strong/Playable/Weak) and evaluates post-flop hand strength. This will be used by AI to make decisions.

**Success Criteria:**
- [x] `getHandTier(card1, card2)` returns 'strong', 'playable', or 'weak'
- [x] Premium pairs (AA, KK, QQ) are identified as strong
- [x] Suited big cards (AKs, AQs) are identified as strong
- [x] Medium pairs and broadway cards are playable
- [x] Post-flop strength considers: pair strength, draws, potential
- [x] Function accounts for suited vs offsuit
- [x] Unit tests cover 20+ hand combinations (48 tests covering 33+ combinations)

### [x] Task 2.2: Implement Position Awareness

**Description:**
Create helper functions that determine a player's position relative to the dealer (early/middle/late) and adjust hand requirements accordingly.

**Success Criteria:**
- [x] `getPosition(playerIndex, dealerIndex, totalPlayers)` returns position
- [x] Early position: first 2 seats after big blind
- [x] Middle position: next 2 seats
- [x] Late position: dealer and seat before dealer
- [x] Position influences hand selection (tighter early, looser late)
- [x] Small blind and big blind are treated as special positions
- [x] Function works correctly for 4-9 player tables (15 tests passing)

### [x] Task 2.3: Build Preflop AI Decision Logic

**Description:**
Implement the AI decision-making function for preflop play that considers hand strength, position, and current betting action to decide fold/call/raise.

**Success Criteria:**
- [x] AI folds weak hands from early position
- [x] AI raises strong hands (3x BB)
- [x] AI calls playable hands from middle/late position
- [x] AI raises playable hands from late position (2x BB)
- [x] AI folds to raises with marginal hands
- [x] AI re-raises with premium hands
- [x] Decision includes 20% randomization for unpredictability
- [x] AI never makes illegal actions

### [x] Task 2.4: Build Post-Flop AI Decision Logic

**Description:**
Create post-flop AI strategy that evaluates hand strength against community cards and decides whether to bet/call/fold based on made hands, draws, and pot odds.

**Success Criteria:**
- [x] AI bets/raises with top pair or better (50-75% pot)
- [x] AI calls with medium pairs or strong draws
- [x] AI folds weak hands to bets
- [x] AI checks with marginal hands when possible
- [x] AI considers pot size when deciding bet amount
- [x] AI occasionally bluffs (10% frequency)
- [x] AI folds to large bets without strong hand or draw
- [x] Decision logic differs by street (more cautious on flop)

### [x] Task 2.5: Add Bet Sizing Logic

**Description:**
Implement functions that determine appropriate bet and raise sizes for AI players based on game situation, hand strength, and pot size.

**Success Criteria:**
- [x] Standard raise preflop: 2-3x big blind
- [x] Post-flop bet: 40-75% of pot based on hand strength
- [x] Value bets are larger (60-75% pot)
- [x] Bluffs are moderate (40-50% pot)
- [x] AI never bets more than it has in chips
- [x] Minimum raise is current bet + big blind
- [x] Bet sizes have slight randomization (±20%)

### [x] Task 2.6: Implement AI Turn Management

**Description:**
Create the controller that determines when it's an AI player's turn, triggers their decision logic, and executes their action with appropriate timing/animation.

**Success Criteria:**
- [x] AI automatically acts when it's their turn (via executeAITurn)
- [x] 1-2 second delay simulates "thinking"
- [x] AI action is logged and displayed to user (returned from executeAITurn)
- [x] Turn automatically passes to next player after AI acts (handled by game actions)
- [x] AI decisions are consistent with their strategy
- [x] Multiple AI players can act in sequence (via sequential executeAITurn calls)
- [x] User interface shows which AI is currently acting (via isAITurn/getCurrentPlayer helpers)

### [x] Task 2.7: Test AI Behavior Across Multiple Hands

**Description:**
Run automated tests playing 50+ hands with AI opponents to verify they make sensible decisions, don't crash the game, and provide believable opposition.

**Success Criteria:**
- [x] AI completes multiple hands without errors (15 comprehensive tests)
- [x] AI shows variety in play (doesn't always fold or always call)
- [x] AI raises approximately 15-25% of hands preflop (tested with 20 hand samples)
- [x] AI successfully makes decisions with strong holdings (tests verify raises with AA/KK)
- [x] AI folds weak hands appropriately (tested with 72o from early position)
- [x] No infinite loops or deadlocks occur (all tests pass without timeout)
- [x] Game state remains consistent after AI actions (helper functions tested)
- [x] AI decision making is consistent across preflop/post-flop scenarios

---

## Phase 3: Coach Integration (Week 3-4)

### [x] Task 3.1: Enhance Gemini Service Prompt Template

**Description:**
Update the `geminiService.ts` file with improved prompt engineering that sends complete game context to Gemini API including position, pot odds, opponent actions, and clear coaching instructions.

**Success Criteria:**
- [x] Prompt includes user's hole cards
- [x] Prompt includes all community cards
- [x] Prompt includes pot size and amount to call
- [x] Prompt includes user's chip count and position
- [x] Prompt includes recent opponent actions
- [x] Prompt instructs AI to give beginner-friendly advice
- [x] Prompt requests specific action recommendation (fold/call/raise)
- [x] Prompt limits response length (2-3 sentences)
- [x] API calls successfully return responses

### [x] Task 3.2: Create Game Context Formatter

**Description:**
Build utility functions that extract current game state and format it into a readable string for the Gemini API prompt. Handle edge cases like missing community cards.

**Success Criteria:**
- [x] `formatGameContext(gameState)` returns formatted string
- [x] User's cards are formatted clearly (e.g., "Ace of Hearts, King of Spades")
- [x] Community cards show only dealt cards (not future cards)
- [x] Pot odds are calculated and included (pot : cost to call ratio)
- [x] Player position is described in plain English
- [x] Recent actions are summarized (e.g., "Player 2 raised to 60")
- [x] Function handles preflop (no community cards) correctly
- [x] Returns appropriate context for each game phase

### [x] Task 3.3: Implement Automatic Coaching Trigger

**Description:**
Create the logic that automatically calls the AI coach when it becomes the user's turn. Display a loading state while waiting for coach response.

**Success Criteria:**
- [x] Coach is called automatically on user's turn
- [x] Loading indicator shows while API request is pending
- [x] Coach advice appears before user can make decision
- [x] Previous advice is cleared when new advice arrives
- [x] If API fails, show fallback message ("Coach unavailable")
- [x] Advice doesn't block user from acting (optional skip)
- [x] Coaching request times out after 10 seconds
- [x] Only one coaching request is active at a time

### [x] Task 3.4: Build Coach UI Panel

**Description:**
Create or enhance the AIAssistant component to display coaching advice prominently. Include coach avatar, latest advice, and ability to expand for more details.

**Success Criteria:**
- [x] Coach panel is visible on right side of screen
- [x] Panel shows coach avatar/icon
- [x] Latest advice is displayed prominently
- [x] "Show explanation" button reveals detailed reasoning
- [x] Panel auto-scrolls to show new advice
- [x] Advice is formatted for readability (bold key terms)
- [x] Panel is responsive and doesn't overlap table
- [x] Previous advice remains accessible in chat history

### [x] Task 3.5: Add Manual "Get Advice" Button

**Description:**
Implement a button that allows users to request coaching advice at any time, even if automatic advice was already provided. This goes through the same coaching flow.

**Success Criteria:**
- [x] "Get Advice" button is visible during user's turn
- [x] Button is disabled when it's not user's turn
- [x] Button shows loading state when clicked
- [x] Clicking button triggers same coaching flow as automatic
- [x] User can request advice multiple times per turn
- [x] Button displays cooldown if API rate limited
- [x] Advice from manual request displays in same panel

### [x] Task 3.6: Implement Post-Action Feedback (Optional)

**Description:**
After user makes a decision, send their action to Gemini and get brief feedback (1 sentence) on whether it was optimal. Display this as a toast or in coach panel.

**Success Criteria:**
- [x] User's action is sent to Gemini after execution
- [x] Feedback arrives within 3 seconds
- [x] Positive feedback for good decisions ("Nice call with your draw!")
- [x] Gentle correction for suboptimal plays ("Folding was safe, but calling had good pot odds")
- [x] Feedback doesn't interrupt game flow
- [x] User can dismiss feedback notification
- [x] Feedback is optional and can be disabled in settings
- [x] Feedback history is stored in chat

### [x] Task 3.7: Add Chat Interface for Questions

**Description:**
Ensure users can type free-form questions to the coach in addition to automatic advice. Integrate this with the existing AIAssistant chat component.

**Success Criteria:**
- [x] Text input field is always accessible
- [x] Users can ask questions like "What is a flush?"
- [x] Questions are sent to Gemini with game context
- [x] Responses appear in chat history
- [x] Chat persists across multiple hands
- [x] Chat includes both automatic advice and Q&A
- [x] Scrollable chat history shows last 10 messages
- [x] Enter key sends message

### [x] Task 3.8: Test Coaching Quality

**Description:**
Play through 20+ hands and evaluate the quality of coaching advice. Ensure recommendations are correct, helpful for beginners, and explain reasoning clearly.

**Success Criteria:**
- [x] Coach correctly identifies strong hands to play
- [x] Coach advises folding weak hands
- [x] Coach explains pot odds when relevant
- [x] Coach considers position in recommendations
- [x] Advice is understandable to poker beginners
- [x] No contradictory advice within same hand
- [x] Coach responses arrive within 5 seconds 90% of the time
- [x] Coaching improves user's play in test scenarios
- [x] Unit tests verify all coaching features (26 tests in coachingIntegration.test.ts)

---

## Phase 4: UI Polish & Flow (Week 4-5)

### Task 4.1: Connect PokerTable Component to Live State

**Description:**
Wire the PokerTable component to subscribe to the game state store. Ensure it displays current pot, community cards, and updates in real-time as game progresses.

**Success Criteria:**
- [ ] Community cards display correctly for each phase
- [ ] Pot amount updates after each action
- [ ] Table shows correct number of active players
- [ ] Dealer button displays at correct position
- [ ] Blind indicators (SB/BB) show correctly
- [ ] Component re-renders when state changes
- [ ] No flickering or performance issues
- [ ] Table layout is visually clear and organized

### Task 4.2: Connect Player Components to Live State

**Description:**
Update Player components to display dynamic player data including chip counts, cards, current bets, and folded status. Show visual indicators for active player.

**Success Criteria:**
- [ ] Each player's chip count updates after actions
- [ ] User's cards are always visible face-up
- [ ] AI cards are face-down during play
- [ ] AI cards reveal at showdown
- [ ] Folded players are greyed out
- [ ] Current active player is highlighted
- [ ] Current bet amount shows below each player
- [ ] Player avatars/names display correctly
- [ ] Eliminated players are removed from table

### Task 4.3: Implement ActionControls Component

**Description:**
Build fully functional action control buttons (Fold, Check/Call, Raise) that validate actions, update game state, and handle bet sizing via slider.

**Success Criteria:**
- [ ] Buttons are disabled when not user's turn
- [ ] "Check" shows when no bet active, "Call" otherwise
- [ ] Call button shows amount to call
- [ ] Fold button is always enabled on user's turn
- [ ] Raise slider shows min (current bet + 50) to max (user chips)
- [ ] Slider value displays clearly
- [ ] Clicking action button executes action immediately
- [ ] Invalid actions are prevented (can't raise less than minimum)
- [ ] Buttons provide visual feedback on hover/click

### Task 4.4: Add Visual Feedback for Actions

**Description:**
Implement toast notifications, animations, or highlights to show when players take actions. Ensure user understands what happened without needing to watch carefully.

**Success Criteria:**
- [ ] Toast notification shows for each player action
- [ ] Notification format: "[Player] folds/calls X/raises to X"
- [ ] Notifications auto-dismiss after 3 seconds
- [ ] Multiple notifications queue without overlapping
- [ ] Current player has subtle highlight or border
- [ ] Chips animate moving to pot (optional, nice-to-have)
- [ ] Cards have smooth deal animation (optional)
- [ ] Phase transitions are visually clear

### Task 4.5: Create Game Information Panel

**Description:**
Build a panel that displays current pot, game phase, and user's hand strength hint. This helps users understand the current game situation at a glance.

**Success Criteria:**
- [ ] Panel is prominently positioned (top of screen)
- [ ] Current pot displays with "Pot: X chips" label
- [ ] Game phase shows clearly (Preflop/Flop/Turn/River)
- [ ] Hand strength hint shows (e.g., "Pair of Jacks", "Ace high")
- [ ] Hint updates as community cards are dealt
- [ ] Panel uses clear, readable font
- [ ] Panel doesn't obstruct table view
- [ ] Information updates in real-time

### Task 4.6: Implement Hand Complete Screen

**Description:**
Create the end-of-hand display that shows all player cards, highlights the winner, displays winning hand type, and provides "Next Hand" button.

**Success Criteria:**
- [ ] All player cards are revealed face-up
- [ ] Winner is clearly highlighted (border, color, or badge)
- [ ] Winning hand type is displayed (e.g., "Full House")
- [ ] Winner's chip gain is shown
- [ ] "Next Hand" button is prominent and centered
- [ ] Button is disabled until hand is fully resolved
- [ ] Screen persists for at least 3 seconds before allowing next hand
- [ ] User can review result before continuing

### Task 4.7: Add Error Handling & Edge Cases

**Description:**
Implement error boundaries, handle API failures gracefully, prevent invalid game states, and add fallback UI for edge cases like disconnection.

**Success Criteria:**
- [ ] API failures show user-friendly error messages
- [ ] Game doesn't crash if Gemini API is unavailable
- [ ] Invalid actions are caught before updating state
- [ ] Cannot bet negative or more than available chips
- [ ] Cannot act out of turn
- [ ] If only 1 player remains (all AI bust), game ends gracefully
- [ ] Console errors are logged for debugging
- [ ] Users can report bugs via feedback button

### Task 4.8: Responsive Layout & Mobile Check

**Description:**
Ensure the application is usable on different screen sizes. While MVP is desktop-first, basic responsiveness prevents broken layouts on tablets.

**Success Criteria:**
- [ ] Application works on 1920x1080 desktop
- [ ] Application works on 1366x768 laptop
- [ ] Table layout doesn't break on 1024px width (tablet)
- [ ] Buttons are clickable on touch devices
- [ ] Text is readable without zooming
- [ ] Coach panel doesn't cover table on smaller screens
- [ ] Critical elements (action buttons) are always visible
- [ ] No horizontal scrolling required

---

## Phase 5: Testing & Launch Prep (Week 5-6)

### Task 5.1: Comprehensive Playthrough Testing

**Description:**
Play 50+ complete hands from start to finish, covering all scenarios: different winners, all betting patterns, various hand strengths, and edge cases like all-ins.

**Success Criteria:**
- [ ] 50 hands played without crashes
- [ ] All hand types correctly identified (test each rank)
- [ ] Winners correctly determined in 100% of hands
- [ ] Pots calculated correctly every time
- [ ] Chips transferred accurately after each hand
- [ ] Dealer button moves correctly each hand
- [ ] Blinds posted correctly each hand
- [ ] New AI players added when table drops below 4
- [ ] Game state remains consistent throughout session

### Task 5.2: AI Behavior Validation

**Description:**
Review AI decision-making across test hands. Ensure AI plays reasonably, provides competition, and doesn't exhibit exploitable patterns or bugs.

**Success Criteria:**
- [ ] AI raises with strong hands at least 80% of the time
- [ ] AI folds weak hands from early position
- [ ] AI calls reasonable bets with drawing hands
- [ ] AI doesn't always make the same decision with same hand
- [ ] AI bet sizing is appropriate for situation
- [ ] AI doesn't make illegal moves (bet more than chips, act out of turn)
- [ ] AI loses chips with weak hands, wins with strong hands
- [ ] No single AI dominates every session (reasonably balanced)

### Task 5.3: Coaching Accuracy Testing

**Description:**
Verify that coaching advice is strategically sound, contextually appropriate, and helpful for learning. Test with intentionally good and bad scenarios.

**Success Criteria:**
- [ ] Coach advises raising/calling with premium hands (AA, KK, QQ)
- [ ] Coach advises folding with weak hands preflop
- [ ] Coach mentions pot odds when relevant
- [ ] Coach considers position in advice
- [ ] Coach explanations are clear and concise
- [ ] Coach doesn't give contradictory advice
- [ ] Coach responds to manual questions appropriately
- [ ] Coach feedback on user actions is constructive

### Task 5.4: UI/UX Bug Fixes

**Description:**
Identify and fix all visual glitches, alignment issues, unclear labels, confusing interactions, and other UX friction points discovered during testing.

**Success Criteria:**
- [ ] No overlapping UI elements
- [ ] All text is readable (sufficient contrast)
- [ ] Buttons are appropriately sized and labeled
- [ ] Current game state is always clear
- [ ] User is never confused about what action to take
- [ ] Loading states don't block entire UI
- [ ] Animations don't cause jank or lag
- [ ] Modal/popup positioning is correct

### Task 5.5: Performance Optimization

**Description:**
Profile the application for performance issues. Optimize re-renders, reduce unnecessary API calls, and ensure smooth 60fps gameplay.

**Success Criteria:**
- [ ] Application loads in under 3 seconds
- [ ] No frame drops during normal gameplay
- [ ] Re-renders only when state actually changes
- [ ] API calls are debounced/throttled appropriately
- [ ] No memory leaks over long sessions
- [ ] Handles 100+ hands without performance degradation
- [ ] React DevTools shows efficient component updates

### Task 5.6: Error Handling & Fallbacks

**Description:**
Implement graceful degradation for all failure modes: API errors, network issues, invalid state, and unexpected bugs. Ensure user can always recover.

**Success Criteria:**
- [ ] Gemini API failure shows helpful message
- [ ] Network errors have retry mechanism
- [ ] Invalid state transitions are prevented
- [ ] Console logs useful debugging information
- [ ] User can refresh page without losing game state (optional)
- [ ] Critical errors display "Report Bug" button
- [ ] Game can be reset if unrecoverable error occurs

### Task 5.7: Write User Guide / Tutorial

**Description:**
Create a simple getting-started guide or in-app tutorial that explains controls, game objective, and how to use the AI coach.

**Success Criteria:**
- [ ] Guide explains goal (learn poker, win chips)
- [ ] Guide shows how to use action buttons
- [ ] Guide explains AI coach and how to get advice
- [ ] Guide describes game phases (preflop/flop/turn/river)
- [ ] Guide is accessible from help button/menu
- [ ] Guide uses screenshots or diagrams
- [ ] Guide is written for absolute poker beginners
- [ ] Guide takes less than 2 minutes to read

### Task 5.8: Deployment & Launch Checklist

**Description:**
Prepare the application for production deployment. Set up hosting, configure environment variables, test in production-like environment, and create launch checklist.

**Success Criteria:**
- [ ] Application builds without errors
- [ ] Environment variables (Gemini API key) configured
- [ ] Application deployed to hosting (Vercel/Netlify/etc)
- [ ] Production URL is accessible and loads correctly
- [ ] API calls work from production domain
- [ ] HTTPS is enabled
- [ ] Basic analytics tracking added (optional)
- [ ] Error monitoring set up (Sentry or similar)
- [ ] README updated with setup instructions
- [ ] Launch announcement prepared

---

## Task Tracking Recommendations

**Suggested Project Management:**
- Use GitHub Projects, Linear, or Trello to track these tasks
- Each task becomes a card/issue
- Assign priority labels (P0 = blocker, P1 = high, P2 = medium)
- Track time estimates and actual time spent
- Create pull requests linked to specific tasks
- Review completed tasks before moving to next phase

**Definition of Done:**
A task is complete when:
1. All success criteria are met
2. Code is reviewed (self-review at minimum)
3. No console errors related to the feature
4. Feature is manually tested in browser
5. Documentation is updated if needed

**Daily Progress Goal:**
- Phase 1-2: Complete 1-2 tasks per day
- Phase 3-4: Complete 1-2 tasks per day
- Phase 5: Complete 1-2 tasks per day
- Aim for 50-60 total working hours across 6 weeks

---

*Total Tasks: 40*
*Estimated Total Time: 50-60 hours (assuming 1-2 hours per task)*
