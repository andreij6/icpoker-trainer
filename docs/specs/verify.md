# Enhanced No-Limit Hold'em Test Scenarios (9-Max)

This document provides a comprehensive test suite for your No-Limit Hold'em application, building upon and enhancing the original test scenarios with additional edge cases, multi-player situations, and critical game flow scenarios.

---

## 1. Game Setup & State Logic

### 1.1 Basic Button & Blind Management

**Button & Blind Assignment (9-Max):**
- **Test:** Start a 9-player game.
- **Expected:** Button is assigned to Seat 1. Seat 2 posts Small Blind (SB). Seat 3 posts Big Blind (BB).

**Button & Blind Assignment (Heads-Up):**
- **Test:** Start a 2-player game (or play down to 2 players).
- **Expected:** The dealer (Button) posts the SB. The non-dealer posts the BB.

**Button Movement:**
- **Test:** Play one full hand with 9 players.
- **Expected:** The button moves one seat to the left (clockwise) for the next hand.

**Blind Posting (Player Joins):**
- **Test:** Have a new AI player join a game in progress.
- **Expected:** The player should wait until the BB reaches them to play for free, or post a BB to play immediately.

**Blind Posting (Player Sits Out & Returns):**
- **Test:** A player in the SB position sits out and misses their blind. They return when the button is on them.
- **Expected:** The player must post both SB and BB ("dead" SB + live BB) to re-enter the hand.

### 1.2 Dead Button Scenarios

**Dead Button (SB Busts):**
- **Test:** The player in the SB busts out of a 3+ player game.
- **Expected:** The button moves to the (now empty) SB seat for one hand, and no SB is posted. The player to the left posts the BB. The button then moves normally.

**Dead Button (Multiple Players Bust):**
- **Test:** Both the SB and Button positions bust out simultaneously.
- **Expected:** Button moves to maintain proper blind posting sequence. The next eligible player to the left posts SB, and the player after that posts BB.

**Dead Button (BB Busts):**
- **Test:** The BB player busts out.
- **Expected:** Button moves normally. The next two eligible players post SB and BB.

### 1.3 AI Player Management

**AI Player Busts:**
- **Test:** An AI player (1 of the 8) loses all their chips.
- **Expected:** That AI player is removed. A new AI player is immediately seated in the empty spot with the default starting stack. The game proceeds to the next hand.

**Multiple AI Players Bust (Same Hand):**
- **Test:** 3 AI players bust out in the same hand.
- **Expected:** All 3 are removed and replaced with new AI players with default stacks before the next hand begins.

**AI Player Replacement Timing:**
- **Test:** An AI player busts during a hand while other players continue.
- **Expected:** The AI is marked as eliminated but remains in the seat until the hand completes. Replacement occurs before the next hand deals.

**Last AI Standing (Near User Bust):**
- **Test:** User has 1 BB left, 7 AIs have busted, only 1 AI remains with chips.
- **Expected:** Game continues heads-up until user either wins or busts. If user busts, entire game resets.

### 1.4 User Player Management

**User Player Busts:**
- **Test:** The User player loses all their chips.
- **Expected:** The hand finishes. The entire game resets. All 9 players (User and 8 AIs) are reset to their starting chip stacks, and button/blinds are reset to default position.

**User Busts While All-In (Multiple Pots):**
- **Test:** User is all-in with side pots active, loses the main pot.
- **Expected:** Hand completes fully, all pots awarded correctly, then game resets.

**User Busts on Final Table:**
- **Test:** User is down to 2 players (user + 1 AI) and loses.
- **Expected:** Game resets to full 9 players with starting stacks.

### 1.5 Blind Level Management

**Static Blind Structure:**
- **Test:** Play 20 hands and monitor blind levels.
- **Expected:** Blinds remain constant throughout (if your game uses fixed blinds).

**Blind Increase (If Applicable):**
- **Test:** If your game has blind increases, play until the blind level should change.
- **Expected:** Blinds increase at the specified interval (e.g., every 10 hands or 10 minutes).

---

## 2. Action & Betting Logic

### 2.1 Action Sequencing

**Action Order (Pre-flop):**
- **Test:** Start a 9-player hand.
- **Expected:** First player to act is UTG (Under the Gun), the player to the left of the BB (Seat 4).

**Action Order (Post-flop):**
- **Test:** Go to the flop with 3+ players.
- **Expected:** First player to act is the active player closest to the left of the dealer button (e.g., SB if still in hand).

**Action Order (Mid-position Folds):**
- **Test:** On the flop, SB is still in but checks. BB folded pre-flop.
- **Expected:** Action proceeds clockwise from SB to next active player.

**Action Order (All Players Check):**
- **Test:** All players check on the flop.
- **Expected:** Turn card is dealt, action starts with first active player left of button.

### 2.2 Minimum Bet & Raise Sizing

**Legal Minimum Bet (Open):**
- **Test:** On the flop, have the first player try to bet.
- **Expected:** Minimum allowed bet must be the size of one BB.

**Legal Minimum Raise (vs. Bet):**
- **Test:** Blinds are 10/20. P1 bets 50. P2 wants to raise.
- **Expected:** Raise amount must be at least 50. Minimum total bet for P2 is 100 (50 call + 50 raise).

**Legal Minimum Raise (vs. Raise):**
- **Test:** Blinds are 10/20. P1 opens to 60 (a raise of 40). P2 wants to re-raise.
- **Expected:** Re-raise amount must be at least 40. Minimum total bet for P2 is 100 (60 call + 40 re-raise).

**Legal Minimum Raise (Multiple Raises):**
- **Test:** Blinds 10/20. P1 raises to 60 (+40), P2 raises to 120 (+60), P3 wants to re-raise.
- **Expected:** Minimum re-raise is +60 (the last raise increment). P3's minimum total bet is 180.

**Bet Sizing After Limp:**
- **Test:** Blinds 10/20. P1 limps (calls 20). P2 wants to raise.
- **Expected:** Minimum raise is +20 (one BB). P2's minimum total bet is 40.

### 2.3 All-In Scenarios

**All-in (Less than Min-Raise):**
- **Test:** P1 bets 100. P2 has 150 chips total and goes all-in. P3 is also in the hand.
- **Expected:** P2's all-in is legal. Because it's not a "full raise," it does not reopen betting for P1. P3 only has to call the 100 bet.

**All-in (Exactly Min-Raise):**
- **Test:** P1 bets 100. P2 has 200 chips and goes all-in (exactly a min-raise).
- **Expected:** P2's all-in is a full raise. Betting is reopened for P1.

**All-in (More than Min-Raise):**
- **Test:** P1 bets 100. P2 has 500 chips and raises to 300. P3 calls 300. Action returns to P1.
- **Expected:** Action is reopened for P1, who can fold, call 200, or re-raise.

**All-in (No Reopen - Less than Half):**
- **Test:** P1 bets 100. P2 goes all-in for 130 (less than half the min-raise of 100). P3 folds.
- **Expected:** Action does NOT reopen for P1. P1 can only call the additional 30 or fold.

**Multiple All-ins (Ascending Order):**
- **Test:** P1 goes all-in for 200. P2 goes all-in for 500. P3 goes all-in for 800.
- **Expected:** Main pot and side pots are created correctly. Remaining players can call 800, fold, or raise if they have more chips.

**Multiple All-ins (Same Amount):**
- **Test:** P1, P2, and P3 all go all-in for exactly 500 chips on the same betting round.
- **Expected:** All three players are in the same pot, no side pots created unless another player has fewer chips.

**All-in Before Action:**
- **Test:** P1 is in the BB with 15 chips (BB is 20). P1 is automatically all-in for 15 pre-flop.
- **Expected:** P1 is all-in for 15. Main pot includes P1's 15. Side pot starts from the remaining 5 from each caller.

**All-in (Cannot Cover Blind):**
- **Test:** Player has 5 chips, SB is 10, BB is 20.
- **Expected:** Player posts all 5 chips and is all-in for that amount.

### 2.4 Special Action Cases

**Closing the Action:**
- **Test:** P1 bets. P2 folds. P3 calls.
- **Expected:** Betting round ends and next street is dealt.

**BB "Check Option":**
- **Test:** In a 9-max game, 5 players limp (call the BB). Action reaches the BB.
- **Expected:** BB player can "check" (already paid) or raise.

**BB "Check Option" (After Raise and Calls):**
- **Test:** P1 raises pre-flop, 3 players call, action returns to BB who only posted the blind.
- **Expected:** BB must act (call, raise, or fold). No free check.

**SB Completes:**
- **Test:** Pre-flop, action folds to SB who has posted half a blind.
- **Expected:** SB can fold (loses the SB), call (add remaining BB amount), or raise.

**Heads-Up Action (Pre-flop):**
- **Test:** In a 2-player game, who acts first pre-flop?
- **Expected:** SB (who is also the Button) acts first.

**Heads-Up Action (Post-flop):**
- **Test:** In a 2-player game, who acts first post-flop?
- **Expected:** BB (out of position) acts first.

**Bet, Everyone Folds:**
- **Test:** P1 bets on the flop, all remaining players fold.
- **Expected:** P1 wins the pot immediately. Hand ends without going to showdown. Next hand begins.

**Pre-flop, Everyone Folds to BB:**
- **Test:** All players fold pre-flop to the BB.
- **Expected:** SB's chips are awarded to BB. Hand ends. Next hand begins.

**Cap Betting (Heads-Up):**
- **Test:** In heads-up, P1 and P2 keep re-raising each other 6+ times.
- **Expected:** No cap on raises in No-Limit. Players can continue until one is all-in or folds.

### 2.5 Invalid Actions & Input Validation

**Invalid Action - Check When Facing Bet:**
- **Test:** A player faces a bet.
- **Expected:** "Check" button must be disabled.

**Invalid Action - Bet Less Than Minimum:**
- **Test:** Player tries to bet/raise less than the minimum.
- **Expected:** Action is rejected or automatically adjusted to minimum.

**Invalid Action - Bet More Than Stack:**
- **Test:** Player tries to bet/raise more than their stack.
- **Expected:** Action is capped at their total stack ("All-in").

**Invalid Action - Fold When Can Check:**
- **Test:** Player can check for free but attempts to fold.
- **Expected:** System either prevents fold or asks for confirmation.

**Invalid Action - Negative Bet:**
- **Test:** Attempt to input a negative bet amount.
- **Expected:** Input is rejected.

**Invalid Action - Bet Zero:**
- **Test:** Player attempts to bet or raise 0 chips.
- **Expected:** Input is rejected or treated as a check.

**Invalid Action - Raise Without Calling First:**
- **Test:** Player faces a bet of 100 and attempts to raise to 150 (only +50 instead of calling 100 then raising).
- **Expected:** System correctly interprets this as calling 100 + raising 50 for total bet of 150.

**Invalid Action - Act Out of Turn:**
- **Test:** Player 5 attempts to act when it's Player 3's turn.
- **Expected:** Action is prevented or queued until Player 5's turn.

---

## 3. Pot Logic

### 3.1 Simple Pots

**Simple Pot (Winner Take All):**
- **Test:** Two players go to showdown. One has a clear winning hand.
- **Expected:** Winner is awarded the entire pot.

**Simple Pot (Everyone Folds):**
- **Test:** One player bets, everyone else folds.
- **Expected:** Betting player wins the pot without showdown.

**Simple Pot (Chopped - Identical Hands):**
- **Test:** P1 has AK. P2 has AK. Board is Q♠ 7♦ 5♣ 2♥ 2♦.
- **Expected:** Both players have Two Pair (Aces, Twos, King kicker). Pot is split evenly.

**Simple Pot (Board Plays):**
- **Test:** P1 has 2♠2♣. P2 has 3♠3♣. Board is A♠ K♠ Q♠ J♠ T♠ (royal flush on board).
- **Expected:** Both players play the board (Royal Flush). Pot is split evenly.

**Split Pot (Odd Chip):**
- **Test:** A pot of 101 chips is to be split between 2 players.
- **Expected:** Extra 1 chip is awarded to the player in the earliest position (closest to left of button).

**Split Pot (Odd Chip - Three Ways):**
- **Test:** A pot of 100 chips is to be split between 3 players with identical hands.
- **Expected:** Two players get 33 chips each, one player gets 34 chips (the player closest to left of button gets the extra chip).

### 3.2 Side Pots - Basic

**Side Pot (One All-in, Two Callers):**
- **Test:** P1 (All-in): 100 chips, P2 (Active): 500 chips, P3 (Active): 500 chips. P2 and P3 both call P1's all-in.
- **Expected:** Main Pot: 300 chips (100 from all 3 players). P1, P2, and P3 are eligible. Side Pot 1: Automatically created for any further betting between P2 and P3.

**Side Pot (Awarding - All-in Loses):**
- **Test:** Using above scenario. P2 has the best hand. P3 has 2nd best. P1 has 3rd best.
- **Expected:** P2 wins both Main Pot and Side Pot 1.

**Side Pot (Awarding - All-in Wins):**
- **Test:** Using above scenario. P1 has the best hand. P3 has 2nd best. P2 has 3rd best.
- **Expected:** P1 wins Main Pot (300). P3 wins Side Pot 1.

**Side Pot (Awarding - All-in Ties for Win):**
- **Test:** P1 (All-in 100), P2 (500), P3 (500). P1 and P2 tie for best hand. P3 loses.
- **Expected:** P1 and P2 split Main Pot (150 each). P2 wins Side Pot 1.

### 3.3 Side Pots - Complex

**Multiple Side Pots ("Russian Doll"):**
- **Test:** P1 (All-in): 50 chips, P2 (All-in): 200 chips, P3 (Active): 1000 chips, P4 (Active): 1000 chips. All players call all-ins.
- **Expected:** Main Pot: 200 (50 from all 4 players). Eligible: P1, P2, P3, P4. Side Pot 1: 450 (remaining 150 from P2, P3, P4). Eligible: P2, P3, P4. Side Pot 2: Created from any further betting between P3 and P4.

**Multiple Side Pots (Three All-ins, Different Stacks):**
- **Test:** P1 (50), P2 (150), P3 (400), P4 (1000), P5 (1000). All players all-in pre-flop.
- **Expected:** 
  - Main Pot: 250 (50×5). Eligible: P1, P2, P3, P4, P5.
  - Side Pot 1: 400 (100×4). Eligible: P2, P3, P4, P5.
  - Side Pot 2: 750 (250×3). Eligible: P3, P4, P5.
  - Side Pot 3: 1200 (600×2). Eligible: P4, P5.

**Side Pot (Winner Folds to Later Bet):**
- **Test:** P1 all-in 100. P2 calls 100. Flop: P2 bets 200 into side pot. P3 folds.
- **Expected:** Main Pot (P1 vs P2) goes to showdown. Side Pot awarded to P2 immediately when P3 folds.

**Side Pot (All-in Wins Side Pot Eligible):**
- **Test:** P1 (100), P2 (500), P3 (500). P1 all-in, others call. Flop creates side pot. P1 has best hand, P2 has second-best.
- **Expected:** P1 wins Main Pot only (300). P2 wins Side Pot.

**Side Pot (Multiple Players Tie in Side Pot):**
- **Test:** P1 (100), P2 (500), P3 (500), P4 (500). P1 all-in. Main pot = 400. Side pot builds to 900 (300 from P2, P3, P4). P2, P3, P4 all have identical hands at showdown.
- **Expected:** P1 wins or loses Main Pot based on hand. Side Pot split evenly among P2, P3, P4 (300 each).

**Side Pot (All-in Player Wins Everything):**
- **Test:** P1 (100), P2 (500), P3 (500). P1 all-in, others call and build side pot to 400. P1 has nuts.
- **Expected:** P1 wins Main Pot (300) only. Winner of P2 vs P3 gets Side Pot (400).

### 3.4 Edge Cases in Pot Calculation

**Pot Calculation (Pre-flop Only):**
- **Test:** All players fold pre-flop except BB.
- **Expected:** BB wins SB amount. Pot awarded correctly.

**Pot Calculation (Antes - If Applicable):**
- **Test:** If your game includes antes, verify they're added to the pot correctly.
- **Expected:** Each player's ante is added to starting pot before any action.

**Pot Calculation (Rake - If Applicable):**
- **Test:** If your game takes a rake, verify correct amount is removed.
- **Expected:** Rake taken from pot according to your game's rules before awarding to winner.

**Pot Display Accuracy:**
- **Test:** Monitor pot size display throughout a hand with multiple betting rounds.
- **Expected:** Pot size updates correctly after each action.

---

## 4. Showdown & Hand Ranking Logic

### 4.1 Hand Rankings - Basic

**All Rankings:**
- **Test:** Create showdown scenario for each hand rank: Royal Flush, Straight Flush, Quads, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.
- **Expected:** Superior hand rank always wins.

**Royal Flush:**
- **Test:** P1 has A♠K♠, P2 has Q♠J♠. Board is T♠9♠8♠7♠6♠.
- **Expected:** P1 wins with Royal Flush vs P2's Queen-high Straight Flush.

**Straight Flush vs Quads:**
- **Test:** P1 has 7♠6♠, P2 has Q♣Q♦. Board is 5♠4♠3♠Q♠Q♥.
- **Expected:** P1 wins with Straight Flush.

**Quads vs Full House:**
- **Test:** P1 has A♠A♣, P2 has K♠K♣. Board is A♦A♥K♦K♥5♠.
- **Expected:** P1 wins with Quad Aces.

**Full House vs Flush:**
- **Test:** P1 has J♠9♠, P2 has 9♣9♦. Board is 9♥8♠7♠6♠5♠.
- **Expected:** P2 wins with Full House (Nines full of something on board) vs P1's Flush.

**Flush vs Straight:**
- **Test:** P1 has A♠2♠, P2 has 9♣8♣. Board is 7♠6♠5♠4♦3♦.
- **Expected:** P1 wins with Ace-high Flush.

**Straight vs Three of a Kind:**
- **Test:** P1 has 9♠8♠, P2 has K♠K♣. Board is 7♦6♥5♣K♦2♠.
- **Expected:** P1 wins with 9-high Straight.

**Three of a Kind vs Two Pair:**
- **Test:** P1 has A♠K♠, P2 has 7♠7♣. Board is 7♦A♣K♦5♠2♥.
- **Expected:** P2 wins with Three of a Kind (Sevens).

**Two Pair vs One Pair:**
- **Test:** P1 has A♠K♠, P2 has A♣Q♣. Board is K♦Q♦5♠4♠2♥.
- **Expected:** P1 wins with Two Pair (Aces and Kings).

**One Pair vs High Card:**
- **Test:** P1 has A♠K♠, P2 has A♣Q♣. Board is J♦9♦7♠4♠2♥.
- **Expected:** P1 wins with Pair of Aces, King kicker.

**High Card vs High Card:**
- **Test:** P1 has A♠K♠, P2 has A♣Q♣. Board is J♦9♦7♠4♠2♥.
- **Expected:** P1 wins with A-K-J-9-7 vs P2's A-Q-J-9-7.

### 4.2 Kickers

**Kicker (One Pair):**
- **Test:** P1 (A♠K♠) vs P2 (A♣Q♣) on board A♦7♣5♠3♦2♥.
- **Expected:** P1 wins (Pair of Aces, K-7-5 kickers vs K kicker).

**Kicker (Two Pair):**
- **Test:** P1 (K♠Q♠) vs P2 (K♣J♣) on board K♦7♣7♠2♦3♥.
- **Expected:** P1 wins (Two Pair Kings and Sevens, Q kicker).

**Kicker (Three of a Kind):**
- **Test:** P1 (A♠K♠) vs P2 (A♣Q♣) on board A♦A♥7♣5♠2♦.
- **Expected:** P1 wins (Three of a Kind Aces, K-7 kickers).

**Kicker (Flush):**
- **Test:** Board has 4 spades: Q♠8♠7♠2♠. River is 3♦. P1 has A♠5♠. P2 has K♠9♠.
- **Expected:** P1 wins (A♠Q♠8♠7♠5♠ vs K♠Q♠9♠8♠7♠).

**Kicker (Full House - Trips Part):**
- **Test:** P1 (T♠T♣) vs P2 (9♠9♣) on board A♠A♣A♦T♦9♦.
- **Expected:** P1 wins (Aces full of Tens vs Aces full of Nines).

**Kicker (Quads):**
- **Test:** P1 (K♠2♣) vs P2 (Q♠3♣) on board A♠A♣A♦A♥7♦.
- **Expected:** P1 wins (Four of a Kind Aces, K kicker).

**Kicker (Identical Pairs, Board Kickers):**
- **Test:** P1 (J♠J♣) vs P2 (J♦J♥) on board A♠K♠Q♠9♠2♦.
- **Expected:** Split pot. Both have Pair of Jacks with A-K-Q kickers.

**Kicker (Playing the Board):**
- **Test:** P1 (2♠3♣) vs P2 (4♠5♣) on board A♠K♠Q♠J♠T♠.
- **Expected:** Split pot. Both play board (Royal Flush).

### 4.3 Straights

**Straight (Ace as High):**
- **Test:** P1 (A♠K♠) vs P2 (K♣Q♣) on board Q♦J♠T♦9♠5♥.
- **Expected:** P1 wins (Ace-high straight).

**Straight (Ace as Low - Wheel):**
- **Test:** P1 (A♠2♠) vs P2 (K♠Q♠) on board 5♣4♦3♠J♦J♣.
- **Expected:** P1 wins (5-high straight, the "wheel").

**Straight (Both Use Board):**
- **Test:** P1 (2♠2♣) vs P2 (3♠3♣) on board T♠9♣8♦7♠6♥.
- **Expected:** Split pot. Both play Ten-high straight on board.

**Straight (Using One Hole Card):**
- **Test:** P1 (9♠8♣) vs P2 (9♦7♣) on board 8♦7♠6♥5♠4♣.
- **Expected:** P1 wins with 9-high straight (9-8-7-6-5) vs P2's 9-high straight (9-8-7-6-5). Wait, these are the same. Let me reconsider. P1 (9♠2♣) vs P2 (8♦7♣) on board 7♠6♥5♠4♣3♦. P1 has 7-high straight (7-6-5-4-3), P2 has 8-high straight (8-7-6-5-4). P2 wins.

**Straight (Using Both Hole Cards):**
- **Test:** P1 (9♠8♣) vs P2 (7♦6♣) on board T♠7♠6♥5♠4♣.
- **Expected:** P1 wins with T-9-8-7-6 straight vs P2's 7-6-5-4-? (P2 doesn't have a straight, has Two Pair).

**Straight (Six-Card Straight on Board+Hand - Best 5):**
- **Test:** P1 (9♠8♣) vs P2 (8♦7♣) on board 7♠6♥5♠4♣3♦.
- **Expected:** P1 wins with 9-high straight (9-8-7-6-5) vs P2's 8-high straight (8-7-6-5-4).

### 4.4 Flushes

**Flush (Ace High Wins):**
- **Test:** P1 (A♠5♠) vs P2 (K♠9♠) on board Q♠8♠7♠2♦3♣.
- **Expected:** P1 wins with A♠Q♠8♠7♠5♠ flush.

**Flush (All Five Cards Matter):**
- **Test:** P1 (K♠J♠) vs P2 (K♦T♦) on board Q♠9♠8♠7♠2♦.
- **Expected:** P1 wins with K♠Q♠J♠9♠8♠ vs P2 who doesn't have a flush.

**Flush (Board Flush, Hole Card Matters):**
- **Test:** P1 (A♠2♣) vs P2 (K♠3♣) on board Q♠J♠9♠8♠7♠.
- **Expected:** P1 wins with A♠Q♠J♠9♠8♠ flush.

**Flush (Board Flush, Neither Can Beat):**
- **Test:** P1 (2♣3♣) vs P2 (4♣5♣) on board A♠K♠Q♠J♠T♠.
- **Expected:** Split pot. Both play board Royal Flush.

**Flush (Both Have Flush, Compare All 5):**
- **Test:** P1 (A♠K♠) vs P2 (A♦Q♦) on board J♠9♠8♠5♠2♣.
- **Expected:** P1 wins with A♠K♠J♠9♠8♠ vs P2 who doesn't have a flush (different suits).

### 4.5 Full Houses

**Full House (Higher Trips Win):**
- **Test:** P1 (K♠K♣) vs P2 (Q♠Q♣) on board K♦Q♦Q♥5♠4♣.
- **Expected:** P1 wins with Kings full of Queens.

**Full House (Same Trips, Higher Pair Wins):**
- **Test:** P1 (T♠T♣) vs P2 (9♠9♣) on board A♠A♣A♦T♦9♦.
- **Expected:** P1 wins with Aces full of Tens.

**Full House (Board Has Trips):**
- **Test:** P1 (K♠Q♠) vs P2 (K♣J♣) on board A♠A♣A♦K♦5♠.
- **Expected:** Split pot if both play Aces full of Kings. Wait, P1 has A-A-A-K-Q, P2 has A-A-A-K-J. P1 should win with higher kicker. Actually both have Aces full of Kings (A-A-A-K-K). Split pot.

**Full House (Board Has Pair):**
- **Test:** P1 (Q♠Q♣) vs P2 (J♠J♣) on board Q♦7♣7♠5♠4♦.
- **Expected:** P1 wins with Queens full of Sevens.

### 4.6 Showdown Process

**Showdown Order (Aggressor Shows First):**
- **Test:** P1 bets the river, P2 calls.
- **Expected:** P1 (aggressor) must show hand first.

**Showdown Order (No Bet on River):**
- **Test:** All players check on the river.
- **Expected:** Player in earliest position (closest to button) shows first.

**Showdown Order (Multiple Callers):**
- **Test:** P1 bets river, P2 calls, P3 calls.
- **Expected:** P1 shows first, then P2, then P3 (in position order).

**Showdown (Winner Can Muck):**
- **Test:** At showdown, P1 shows winning hand. P2 has worse hand.
- **Expected:** P2 should be able to muck (not show) their losing hand.

**Showdown (Must Show to Win):**
- **Test:** P1 bets river and shows hand. P2 has better hand but mucks without showing.
- **Expected:** P1 wins pot (P2 forfeits by mucking).

**Showdown (All-in Pre-flop):**
- **Test:** All players all-in pre-flop.
- **Expected:** All hands are shown immediately. Board runs out completely. Winner(s) determined and pot(s) awarded.

**Showdown (Side Pot - Partial Reveal):**
- **Test:** P1 all-in (eligible for main pot only). P2 and P3 go to showdown for side pot. P2 shows losing hand for side pot.
- **Expected:** P3 wins side pot. P1 must still show to contest main pot against P3.

---

## 5. Card Dealing & Board Logic

### 5.1 Deck Management

**Deck Integrity:**
- **Test:** Play multiple hands and track all cards dealt.
- **Expected:** 52-card deck, no duplicates, all cards accounted for.

**Shuffle Randomness:**
- **Test:** Play 100 hands and track starting hands distribution.
- **Expected:** All starting hands should appear with roughly equal frequency over time.

**Burn Cards (If Implemented):**
- **Test:** Monitor if burn cards are used before flop, turn, river.
- **Expected:** One card burned before flop, one before turn, one before river (standard rules).

**No Card Memory Between Hands:**
- **Test:** Note folded cards in Hand 1, verify they can appear in Hand 2.
- **Expected:** Full deck shuffled each hand; previous folded cards can reappear.

### 5.2 Board Dealing

**Flop Deals Three Cards:**
- **Test:** Verify flop always shows exactly 3 cards.
- **Expected:** Flop displays 3 cards simultaneously.

**Turn Deals One Card:**
- **Test:** Verify turn adds exactly 1 card to the board.
- **Expected:** Board shows 4 cards total after turn.

**River Deals One Card:**
- **Test:** Verify river adds exactly 1 card to the board.
- **Expected:** Board shows 5 cards total after river.

**Board Cards Are Visible:**
- **Test:** Monitor board throughout hand.
- **Expected:** All community cards remain visible once dealt until hand ends.

**No Premature Board Dealing:**
- **Test:** Fold before flop.
- **Expected:** No flop/turn/river dealt if betting ends pre-flop.

### 5.3 Hand Dealing

**Each Player Gets Two Cards:**
- **Test:** Start a hand with 9 players.
- **Expected:** Each player receives exactly 2 hole cards.

**Hole Cards Hidden (AI Players):**
- **Test:** Observe AI player cards during hand.
- **Expected:** AI cards are not visible to user during hand.

**Hole Cards Visible (User Player):**
- **Test:** Start a hand.
- **Expected:** User can see their own two hole cards.

**Hole Cards Revealed at Showdown:**
- **Test:** Go to showdown.
- **Expected:** All players going to showdown have their cards revealed.

---

## 6. AI Behavior & Decision Making

### 6.1 Basic AI Actions

**AI Makes Valid Actions:**
- **Test:** Monitor AI actions over 50 hands.
- **Expected:** All AI actions are legal (no betting out of turn, correct bet sizing, etc.).

**AI Folds Weak Hands:**
- **Test:** Observe AI behavior with poor hole cards pre-flop.
- **Expected:** AI should fold most weak hands (e.g., 7-2 offsuit).

**AI Calls with Medium Hands:**
- **Test:** Observe AI behavior with medium-strength hands.
- **Expected:** AI should sometimes call with hands like suited connectors, medium pairs.

**AI Raises with Strong Hands:**
- **Test:** Observe AI behavior with premium hands (AA, KK, AK).
- **Expected:** AI should raise most of the time with premium hands.

**AI Bluffs Occasionally:**
- **Test:** Monitor AI betting patterns over many hands.
- **Expected:** AI should occasionally bet/raise with weaker hands (bluffing).

**AI Adjusts to Position:**
- **Test:** Monitor AI actions from early vs late position.
- **Expected:** AI should play tighter from early position, looser from late position.

### 6.2 AI Bet Sizing

**AI Bets Appropriate Amounts:**
- **Test:** Monitor AI bet sizes over multiple hands.
- **Expected:** AI bets should be reasonable (e.g., 0.5x-1.5x pot typically, not always min-bet or all-in).

**AI Respects Pot Odds:**
- **Test:** Create scenario where AI faces a large bet with a weak hand.
- **Expected:** AI should fold if pot odds don't justify a call.

**AI Values Bets:**
- **Test:** AI has a strong hand on the river.
- **Expected:** AI should bet an amount designed to get called by worse hands.

### 6.3 AI Edge Cases

**AI Doesn't Timeout:**
- **Test:** Play 50 hands and time AI decision-making.
- **Expected:** AI makes decisions within reasonable time (< 3 seconds per action).

**AI Acts When All-In:**
- **Test:** AI is all-in on flop.
- **Expected:** AI has no more actions but stays in hand until showdown.

**AI Handles Disconnection (If Applicable):**
- **Test:** Simulate AI player disconnection.
- **Expected:** AI is folded or replaced appropriately.

---

## 7. User Interface & Experience

### 7.1 Display Accuracy

**Pot Size Display:**
- **Test:** Monitor displayed pot size throughout a hand.
- **Expected:** Pot size accurately reflects all bets, calls, blinds, and antes.

**Player Stack Display:**
- **Test:** Monitor each player's chip count.
- **Expected:** Chip counts update correctly after each action.

**Current Bet Display:**
- **Test:** Multiple players bet/raise.
- **Expected:** Current bet amount is clearly displayed and accurate.

**Bet Slider/Input Accuracy:**
- **Test:** Use bet slider or input field to bet various amounts.
- **Expected:** Bet amount reflects slider position or input value exactly.

**Hand Strength Indicator (If Applicable):**
- **Test:** If your UI shows hand strength, verify accuracy.
- **Expected:** Indicator correctly reflects user's hand strength based on current board.

### 7.2 Button States

**Action Buttons Enable/Disable Correctly:**
- **Test:** Face various scenarios (can check, must call, can raise, etc.).
- **Expected:** Only valid action buttons are enabled.

**Fold Button Always Available (Except When Checked):**
- **Test:** Player can check for free.
- **Expected:** Fold button should be disabled (folding when you can check is bad UI).

**All-In Button:**
- **Test:** Click all-in button.
- **Expected:** Bet amount is set to player's entire stack.

**Min/Max Bet Buttons (If Applicable):**
- **Test:** Click min bet or max bet buttons.
- **Expected:** Bet amount adjusts to minimum or maximum allowed.

### 7.3 Visual Feedback

**Highlight Active Player:**
- **Test:** Monitor whose turn it is.
- **Expected:** Active player's seat is highlighted or clearly indicated.

**Show Player Actions:**
- **Test:** Watch as players fold, call, raise.
- **Expected:** Each action is visually represented (text, animation, chip movement).

**Winning Hand Highlight:**
- **Test:** Go to showdown.
- **Expected:** Winning hand(s) and winning player(s) are clearly highlighted.

**Card Animations:**
- **Test:** Watch cards being dealt.
- **Expected:** Smooth animations for dealing cards (if implemented).

**Chip Animations:**
- **Test:** Watch chips move during betting.
- **Expected:** Chips animate from player to pot (if implemented).

---

## 8. Game Persistence & State Management

### 8.1 Game State Consistency

**State Persists During Hand:**
- **Test:** Play a hand and monitor all variables (pot, stacks, bets, board, etc.).
- **Expected:** All state variables remain accurate throughout the hand.

**State Resets Between Hands:**
- **Test:** Finish a hand and start a new one.
- **Expected:** Pot resets to 0, bets reset to 0, new cards dealt, button moves.

**State After User Busts:**
- **Test:** User busts out.
- **Expected:** Entire game state resets: all players back to starting stacks, button reset, new deck.

**State After AI Busts:**
- **Test:** AI player busts.
- **Expected:** AI is replaced with new AI. Game state continues normally for next hand.

### 8.2 Error Handling

**Invalid Game State Recovery:**
- **Test:** Force an invalid game state (if possible through testing hooks).
- **Expected:** Game detects error and either corrects state or resets game gracefully.

**Network Error Handling (If Online):**
- **Test:** Simulate network disconnection.
- **Expected:** Game handles disconnection gracefully (pauses, saves state, or resets).

**AI Error Handling:**
- **Test:** Force AI to make an invalid decision (if possible).
- **Expected:** Game prevents invalid action or auto-corrects AI behavior.

---

## 9. Edge Cases & Rare Scenarios

### 9.1 Extreme Stack Sizes

**Very Short Stack (<1 BB):**
- **Test:** Player has 5 chips, BB is 20.
- **Expected:** Player posts all 5 chips as partial blind and is immediately all-in.

**Very Large Stack (>1000 BB):**
- **Test:** Player accumulates 50,000 chips (BB is 20).
- **Expected:** All betting mechanics still work correctly with large numbers.

**Stack Equality:**
- **Test:** All 9 players have exactly 1000 chips.
- **Expected:** Game proceeds normally.

**One Player Dominates:**
- **Test:** One player has 8000 chips, other 8 players have 125 chips each.
- **Expected:** Blinds still function, short stacks are all-in frequently, game continues.

### 9.2 Unusual Board Combinations

**Board Paired Four Times:**
- **Test:** Board is A♠A♣A♦A♥K♠.
- **Expected:** All players have Four Aces. Kicker determines winner.

**Board is Rainbow (5 Different Suits):** 
- **Test:** Actually impossible with 4 suits. Skip this test.

**Board has Four to a Straight Flush:**
- **Test:** Board is J♠T♠9♠8♠2♣.
- **Expected:** Player with Q♠ has straight flush and wins.

**Board is Monotone (All One Suit):**
- **Test:** Board is A♠K♠Q♠J♠T♠.
- **Expected:** All players have Royal Flush. Pot is split.

### 9.3 Timing Edge Cases

**Last Second Action:**
- **Test:** User takes maximum time to act (if there's a timer).
- **Expected:** Action is registered if made before timer expires.

**Timer Expiration:**
- **Test:** User doesn't act within time limit (if applicable).
- **Expected:** User is auto-folded or auto-checked.

**Simultaneous Actions (Multi-table - N/A for Single Table):**
- **Test:** N/A - your game is single table.

### 9.4 Pre-flop All-Ins

**Everyone All-In Pre-flop:**
- **Test:** All 9 players go all-in pre-flop.
- **Expected:** All hands revealed. Board runs out. Pots awarded correctly.

**Partial All-Ins Pre-flop:**
- **Test:** 3 players all-in pre-flop with different stacks (100, 300, 500). 2 players call with 1000+ chips.
- **Expected:** Main pot and side pots created correctly. Board runs out once.

---

## 10. Performance & Stress Testing

### 10.1 Extended Play

**100 Hand Test:**
- **Test:** Play 100 consecutive hands.
- **Expected:** No crashes, memory leaks, or performance degradation.

**1000 Hand Test:**
- **Test:** Simulate or play 1000 hands.
- **Expected:** Game remains stable and performant.

### 10.2 Rapid Actions

**Fast Betting:**
- **Test:** Make rapid-fire bets/calls/folds.
- **Expected:** Game handles quick inputs without errors.

**Spamming Buttons:**
- **Test:** Click action buttons rapidly or repeatedly.
- **Expected:** Only one action registers; duplicate actions are ignored.

### 10.3 Memory & Resources

**Memory Usage:**
- **Test:** Monitor memory usage over extended play.
- **Expected:** Memory usage remains stable (no memory leaks).

**CPU Usage:**
- **Test:** Monitor CPU usage during play.
- **Expected:** CPU usage is reasonable (AI shouldn't cause excessive load).

---

## 11. Rules Compliance

### 11.1 Official Poker Rules

**No-Limit Hold'em Rules:**
- **Test:** Review all test scenarios above.
- **Expected:** Game follows official No-Limit Hold'em rules (as per WSOP/TDA).

**Minimum Opening Bet:**
- **Test:** First bet on any street must be at least the BB amount.
- **Expected:** Game enforces this rule.

**Minimum Raise:**
- **Test:** Any raise must be at least the size of the previous bet or raise.
- **Expected:** Game enforces this rule.

**All-In Protection:**
- **Test:** Player all-in for less than the minimum raise.
- **Expected:** All-in is allowed but doesn't reopen action (unless it's a full raise).

**String Betting:**
- **Test:** In a live setting, not fully applicable to digital poker.
- **Expected:** N/A for digital implementation.

---

## 12. New Scenarios & Enhancements

### 12.1 Blinds vs. Antes

**Game with Blinds Only:**
- **Test:** Current implementation (if no antes).
- **Expected:** SB and BB posted correctly each hand.

**Game with Antes (Future Feature):**
- **Test:** If antes are added, each player posts ante before blinds.
- **Expected:** Antes added to pot, then blinds posted, then cards dealt.

### 12.2 Tournament vs. Cash Game

**Cash Game Mode (Current):**
- **Test:** Fixed blind levels, ability to rebuy (if user busts, reset).
- **Expected:** Blinds stay constant, game resets on user bust.

**Tournament Mode (Future):**
- **Test:** Blinds increase at intervals, no rebuys, winner takes all.
- **Expected:** Blinds increase, players eliminated don't return, last player wins.

### 12.3 Multiple Board Runs (If Implementing Run-it-Twice)

**Run It Once (Standard):**
- **Test:** Standard all-in situation with board run once.
- **Expected:** Board dealt once, pot awarded to winner(s).

**Run It Twice (Advanced Feature):**
- **Test:** If implemented, deal board twice after all-in.
- **Expected:** Pot split based on two board outcomes.

### 12.4 Time Bank (Optional Feature)

**Time Bank Usage:**
- **Test:** If time bank feature exists, user activates time bank when timer is low.
- **Expected:** Additional time granted for that decision.

**Time Bank Depletion:**
- **Test:** User runs out of time bank.
- **Expected:** User is auto-folded on subsequent timeouts.

---

## 13. Accessibility & Usability

### 13.1 User Input Validation

**Bet Input Out of Range:**
- **Test:** User inputs bet amount less than minimum or greater than stack.
- **Expected:** Error message or automatic adjustment to valid range.

**Non-Numeric Input:**
- **Test:** User enters letters or symbols in bet field.
- **Expected:** Input rejected or filtered to numeric only.

**Negative Input:**
- **Test:** User enters negative number.
- **Expected:** Input rejected.

### 13.2 Keyboard Shortcuts (If Applicable)

**Fold Shortcut:**
- **Test:** Press 'F' key to fold (if implemented).
- **Expected:** Player folds.

**Call Shortcut:**
- **Test:** Press 'C' key to call.
- **Expected:** Player calls current bet.

**Raise Shortcut:**
- **Test:** Press 'R' key to bring up raise input.
- **Expected:** Raise input is focused.

**All-In Shortcut:**
- **Test:** Press 'A' key to go all-in.
- **Expected:** Player bets entire stack.

---

## 14. Multi-Language & Localization (If Applicable)

**Default Language:**
- **Test:** Start game.
- **Expected:** Game displays in default language (English).

**Language Switch:**
- **Test:** If multi-language support exists, switch language.
- **Expected:** All UI elements update to new language.

---

## 15. Logging & Debugging

### 15.1 Hand History

**Hand History Recording:**
- **Test:** Play several hands.
- **Expected:** If hand history feature exists, all actions are logged accurately.

**Hand History Playback:**
- **Test:** Review a previous hand.
- **Expected:** Hand can be replayed accurately.

### 15.2 Error Logging

**Error Logs:**
- **Test:** Force an error condition (invalid state, network issue, etc.).
- **Expected:** Error is logged with timestamp and details for debugging.

---

## Summary

This enhanced test document provides over 200 distinct test scenarios covering:
- **Game setup and state management** (including complex dead button scenarios, player replacement)
- **Betting logic** (including all-in edge cases, multiple raise scenarios, invalid actions)
- **Pot calculations** (simple, split, and complex multi-way side pots)
- **Hand evaluation** (all hand ranks, kickers, straights, flushes, full houses)
- **Showdown procedures** (aggressor rules, mucking, partial reveals)
- **Card dealing and deck integrity**
- **AI behavior** (valid actions, bet sizing, decision-making)
- **UI/UX elements** (button states, visual feedback, display accuracy)
- **Game persistence** (state consistency, error recovery)
- **Edge cases** (extreme stacks, unusual boards, timing issues)
- **Performance and stress testing**
- **Rules compliance** (official No-Limit Hold'em rules)

By thoroughly testing all scenarios in this document, you'll ensure your No-Limit Hold'em application handles every possible game state correctly and provides a robust, accurate poker experience for your users.