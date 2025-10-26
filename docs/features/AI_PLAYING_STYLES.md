# AI Playing Styles - No Limit Hold'em

## Overview

Each AI player has a distinct playing style that affects their decision-making, hand selection, bet sizing, and overall strategy. This creates a more realistic and challenging poker experience.

**Note:** Player names are randomly generated each game and do not reveal their playing style. Part of the challenge is identifying which players are playing which styles based on their actions!

## Playing Style Profiles

### 1. Rock
**Style:** Ultra-tight, only plays premium hands

**Characteristics:**
- **VPIP:** 12% (plays only 12% of hands)
- **PFR:** 10% (raises 10% of hands)
- **Aggression Factor:** 2.5
- **Strategy:** Waits for premium hands (AA, KK, QQ, AK) and plays them aggressively. Very predictable but dangerous when in a pot.

**How to Play Against:**
- Fold when they show strength
- Steal their blinds frequently
- Don't bluff them - they only call with good hands

---

### 2. Maniac
**Style:** Hyper-aggressive, plays too many hands

**Characteristics:**
- **VPIP:** 50% (plays 50% of hands)
- **PFR:** 40% (raises 40% of hands)
- **Aggression Factor:** 5.0
- **Bluff Frequency:** 40%
- **Strategy:** Raises and re-raises constantly, makes large bets (often overbets), difficult to put on a hand.

**How to Play Against:**
- Wait for strong hands and let them bet into you
- Don't try to bluff them - they call too much
- Be prepared for high variance

---

### 3. Tight-Aggressive (TAG)
**Style:** Solid, balanced poker - the "by the book" player

**Characteristics:**
- **VPIP:** 20% (plays 20% of hands)
- **PFR:** 15% (raises 15% of hands)
- **Aggression Factor:** 3.0
- **Strategy:** Plays premium and strong hands aggressively, folds marginal hands. Most balanced and difficult opponent.

**How to Play Against:**
- Respect their raises
- Look for spots to exploit their tight image
- Play position against them

---

### 4. Calling Station
**Style:** Calls too much, rarely folds

**Characteristics:**
- **VPIP:** 45% (plays 45% of hands)
- **PFR:** 8% (rarely raises)
- **Aggression Factor:** 0.8 (calls more than bets)
- **Call Down Frequency:** 80%
- **Strategy:** Calls bets with weak hands, doesn't fold enough, rarely raises. Easy to exploit but frustrating.

**How to Play Against:**
- Don't bluff - they call everything
- Value bet thin - they'll call with weak hands
- Avoid fancy plays - straightforward poker works best

---

### 5. Shark
**Style:** Balanced, adaptive, skilled player

**Characteristics:**
- **VPIP:** 25% (balanced)
- **PFR:** 18% (balanced)
- **Aggression Factor:** 2.8
- **Strategy:** Adapts to situations, plays solid poker, mixes up play, hardest to read.

**How to Play Against:**
- Most challenging opponent
- Need to vary your play
- Pay attention to their adjustments

---

### 6. Loose-Aggressive (LAG)
**Style:** Plays many hands aggressively

**Characteristics:**
- **VPIP:** 35% (plays 35% of hands)
- **PFR:** 25% (raises 25% of hands)
- **Aggression Factor:** 3.5
- **Bluff Frequency:** 25%
- **Strategy:** Plays a wide range of hands aggressively, applies pressure, dangerous in position.

**How to Play Against:**
- 3-bet them with strong hands
- Call down lighter - they bluff often
- Play back at them to slow them down

---

### 7. Tight-Passive
**Style:** Tight but passive, rarely raises

**Characteristics:**
- **VPIP:** 18% (plays 18% of hands)
- **PFR:** 8% (rarely raises)
- **Aggression Factor:** 1.5
- **Strategy:** Plays decent hands but passively, calls more than raises, easy to push around.

**How to Play Against:**
- Steal pots with aggression
- When they bet, respect it (they have something)
- Value bet thin - they call with medium hands

---

### 8. Loose-Passive
**Style:** Plays too many hands passively

**Characteristics:**
- **VPIP:** 40% (plays 40% of hands)
- **PFR:** 10% (rarely raises)
- **Aggression Factor:** 1.2
- **Call Down Frequency:** 65%
- **Strategy:** Plays too many hands, calls too much, doesn't apply enough pressure.

**How to Play Against:**
- Value bet frequently
- Don't bluff often - they call too much
- Isolate them with raises

---

## No Limit Hold'em Bet Sizing

### Preflop Raises
- **Standard Opening:** 2.5-4x BB
- **3-Bet:** 3x the original raise
- **Maniacs:** 4-7x BB opens, 3.5-5x raises
- **Rocks/Passive:** 2.5-3x BB opens

### Postflop Bets
- **Value Bets:** 50-85% of pot (varies by style)
- **Bluffs:** 40-70% of pot
- **Maniacs:** Can overbet (100-200% pot)
- **Passive Players:** 30-55% pot

### All-In Situations
All players will go all-in when:
- They have a monster hand
- Their remaining stack is less than a pot-sized bet
- They're short-stacked and have a premium hand

## Style Statistics Reference

| Style | VPIP | PFR | Agg Factor | Bluff % | 3-Bet % |
|-------|------|-----|------------|---------|---------|
| Rock | 12% | 10% | 2.5 | 2% | 5% |
| Maniac | 50% | 40% | 5.0 | 40% | 25% |
| TAG | 20% | 15% | 3.0 | 15% | 8% |
| Calling Station | 45% | 8% | 0.8 | 3% | 2% |
| Shark | 25% | 18% | 2.8 | 18% | 10% |
| LAG | 35% | 25% | 3.5 | 25% | 12% |
| Tight-Passive | 18% | 8% | 1.5 | 5% | 3% |
| Loose-Passive | 40% | 10% | 1.2 | 8% | 4% |

## Glossary

- **VPIP:** Voluntarily Put money In Pot - % of hands played
- **PFR:** PreFlop Raise - % of hands raised preflop
- **Aggression Factor:** Ratio of bets/raises to calls (higher = more aggressive)
- **3-Bet:** Re-raising a preflop raise
- **BB:** Big Blind

## Strategy Tips

### Against Tight Players (Rock, TAG, Tight-Passive)
- Steal their blinds frequently
- Fold when they show strength
- Don't bluff often - they don't call without a hand

### Against Loose Players (Maniac, LAG, Loose-Passive, Calling Station)
- Tighten up your hand selection
- Value bet more frequently
- Reduce bluffing - they call too much
- Let them bet into you with strong hands

### Against Aggressive Players (Maniac, LAG, TAG)
- Be prepared to play for stacks
- 3-bet with strong hands
- Call down lighter when you have a hand
- Use their aggression against them

### Against Passive Players (Calling Station, Tight-Passive, Loose-Passive)
- Bet for value with medium-strength hands
- Don't bluff - they call too much
- When they bet, respect it
- Apply pressure with position

## Implementation Details

Each AI player's style affects:
1. **Hand Selection:** Which hands they play from which positions
2. **Preflop Aggression:** How often they raise vs. call
3. **Bet Sizing:** How much they bet in different situations
4. **Bluff Frequency:** How often they bluff
5. **Call Down Tendency:** How often they call bets
6. **3-Bet Frequency:** How often they re-raise preflop
7. **Fold to C-Bet:** How often they fold to continuation bets

This creates 8 distinct opponents with different tendencies, making the game more realistic and educational for learning poker strategy.

