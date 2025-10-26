# AI Coach System

## Overview
The AI Coach is an intelligent assistant powered by Google's Gemini AI that provides real-time poker strategy advice, answers questions, and tracks game actions. It's designed to help players improve their poker skills through contextual guidance and analysis.

## Table of Contents
- [Core Features](#core-features)
- [User Interface](#user-interface)
- [Advice System](#advice-system)
- [Action Tracking](#action-tracking)
- [Question & Answer](#question--answer)
- [Auto-Advice Mode](#auto-advice-mode)
- [Context Awareness](#context-awareness)
- [Technical Implementation](#technical-implementation)

## Core Features

### Real-Time Advice
- **On-Demand**: Request advice any time during your turn
- **Automatic**: Optional auto-advice when it's your turn
- **Contextual**: Considers current game state, position, stack sizes
- **Strategic**: Provides reasoning behind recommendations

### Action History
- **Complete Log**: All player actions recorded chronologically
- **Visual Distinction**: Different styling for different action types
- **Alignment**: 
  - User actions: Right-aligned
  - AI actions: Left-aligned  
  - Dealer actions: Center-aligned
- **Persistent**: History maintained throughout session

### Interactive Chat
- **Natural Language**: Ask questions in plain English
- **Poker Expertise**: Understands poker terminology and concepts
- **Multi-Turn**: Maintains conversation context
- **Quick Prompts**: Pre-defined questions for common scenarios

## User Interface

### Panel Layout

```
┌─────────────────────────────────────┐
│ [Auto-advice Toggle]                │ ← Settings
├─────────────────────────────────────┤
│                                     │
│  Dealer starts a new hand           │ ← Action history
│  You are in middle position         │   (scrollable)
│  < Sarah raises to $100             │
│  > You called $100                  │
│  ...                                │
│                                     │
├─────────────────────────────────────┤
│ [Ask a question...        ] [Send] │ ← Input
└─────────────────────────────────────┘
```

### Panel Dimensions
- **Height**: Fixed 520px (prevents layout jumping)
- **Sections**:
  - Toggle: 24px
  - Messages: 360px (scrollable)
  - Input: 2 lines (auto-expanding)

### Visual Design
- **Background**: Semi-transparent dark with border
- **Scrollbar**: Hidden by default, visible on hover
- **Messages**: Newest at bottom, auto-scroll
- **Colors**:
  - Advice: White text
  - Actions: Context-dependent
  - System: Muted colors

## Advice System

### When to Request Advice

**Optimal Moments**:
- Facing a difficult decision
- Uncertain about hand strength
- Complex pot odds situation
- Multi-way pot
- Tournament bubble
- Unfamiliar opponent behavior

**Less Useful**:
- Obvious folds (trash hands)
- Automatic calls (nut hands)
- Time pressure situations

### Advice Structure

The AI provides structured recommendations:

```
Recommended Action: Call $50
  
Why: You have a strong drawing hand with 9 outs to the nut 
flush. The pot odds (3:1) are favorable compared to your 
drawing odds (4:1).

Key Factors:
• Position: In position allows you to control pot size
• Stack: Deep enough to see river if you hit
• Opponent: Aggressive player likely betting with wide range
• Pot Odds: Getting 3:1 on your money
```

### Advice Quality Factors

**Game State Analysis**:
- Your hole cards
- Community cards
- Pot size
- Current bet
- Your stack size
- Opponent stack sizes
- Your position
- Number of active players
- Betting history

**Strategic Considerations**:
- Hand strength
- Drawing potential
- Pot odds
- Implied odds
- Position advantage
- Opponent tendencies
- Stack-to-pot ratio (SPR)
- Tournament considerations

## Action Tracking

### Action Types

#### Player Actions
**Fold**:
```
< Sarah folds
```
- Gray text
- Left-aligned (AI) or right-aligned (User)
- Indicates player out of hand

**Call**:
```
> You called $50
< Jordan calls $50
```
- Standard text color
- Shows amount matched

**Raise**:
```
> You raised to $150
< Riley raises to $300
```
- Prominent display
- Shows total bet amount (not increment)

**Check**:
```
> You checked
< Dakota checks
```
- Neutral action
- No amount shown

**Bet**:
```
< Skylar bets $75
```
- Initial bet in round
- Shows bet amount

#### Dealer Actions
**New Hand**:
```
      Dealer advances button to Player 5
      Dealer starts a new hand
```
- Centered text
- Announces new hand start
- Shows button movement

**Blinds**:
```
      Casey posts small blind $25
      Avery posts big blind $50
```
- Centered text
- Records blind posting
- Maintains pot accuracy

**Position Announcement**:
```
      You are under the gun (UTG)
      You are in the cutoff
```
- Centered text
- Informs user of position
- Only shown if not button/blinds

### Action Styling

**Visual Hierarchy**:
1. **Dealer Actions**: Centered, system color
2. **User Actions**: Right-aligned, highlighted
3. **AI Actions**: Left-aligned, standard color
4. **Folds**: Gray/muted color

**Color Coding**:
- Raises: Prominent (yellow/gold)
- Calls: Standard (white)
- Checks: Neutral (white/gray)
- Folds: Muted (gray)
- Dealer: System (white/60%)

## Question & Answer

### Asking Questions

**How to Ask**:
1. Type question in input box
2. Press Enter or click Send
3. AI processes with full game context
4. Response appears in chat

**Question Types**:

**Strategy Questions**:
- "Should I call with middle pair?"
- "What are my pot odds?"
- "Is this a good spot to bluff?"

**Hand Analysis**:
- "How strong is my hand?"
- "What hands beat me?"
- "What's my equity?"

**Opponent Analysis**:
- "What does this bet size mean?"
- "Is opponent bluffing?"
- "How to play against aggressive player?"

**General Poker**:
- "What is implied odds?"
- "When should I fold top pair?"
- "Explain position advantage"

### Quick Prompts

**Pre-Flop**:
- "Should I raise with this hand?"
- "What's my position worth?"
- "How to play against a raise?"

**Post-Flop**:
- "Do I have the right odds to call?"
- "Should I continue with this draw?"
- "How to play this made hand?"

**Turn/River**:
- "Should I bet for value?"
- "Is this a good bluffing spot?"
- "How much should I bet?"

### Response Quality

**Comprehensive Answers**:
- Considers full game context
- Explains reasoning
- Provides multiple perspectives
- Suggests alternative lines

**Educational Focus**:
- Teaches concepts
- Explains why, not just what
- Builds poker knowledge
- Improves decision-making

## Auto-Advice Mode

### How It Works

**When Enabled**:
1. Your turn begins
2. AI automatically analyzes situation
3. Advice appears in chat
4. You can still ask follow-up questions

**When Disabled**:
- No automatic advice
- Must manually request advice
- Still can ask questions anytime

### Toggle Control

**Location**: Top of AI Coach panel
**Appearance**: Modern toggle switch
**State**: 
- ON: Auto-advice enabled (default)
- OFF: Manual advice only
**Persistence**: Setting saved to localStorage

### Benefits

**Auto-Advice ON**:
- ✅ Never miss guidance
- ✅ Consistent learning
- ✅ Faster improvement
- ✅ Good for beginners
- ❌ Can be distracting
- ❌ May slow down play

**Auto-Advice OFF**:
- ✅ Faster gameplay
- ✅ Test your skills
- ✅ Less information overload
- ✅ Good for experienced players
- ❌ Must remember to ask
- ❌ May miss learning opportunities

## Context Awareness

### Game State Context

The AI has access to:

**Your Information**:
- Hole cards
- Stack size
- Position
- Actions taken this hand
- Bet amounts

**Table Information**:
- Community cards
- Pot size
- Number of active players
- Current bet
- Betting history

**Opponent Information**:
- Stack sizes
- Positions
- Actions taken
- Bet sizing patterns
- Playing styles (if known)

### Contextual Advice Examples

**Example 1: Drawing Hand**
```
Situation: You have K♥Q♥, flop is A♥ 7♥ 2♠
Pot: $200, Bet: $100, Your stack: $1,500

Advice: "Call. You have the nut flush draw (9 outs) 
plus potential straight draws. With 9 outs, you're 
about 35% to hit by the river. The pot is offering 
you 3:1 odds ($100 to win $300), which makes this 
a profitable call. Your position also allows you to 
see the turn cheaply and re-evaluate."
```

**Example 2: Made Hand**
```
Situation: You have A♠A♥, flop is A♦ 7♣ 2♥
Pot: $150, Checked to you, Your stack: $2,000

Advice: "Bet $75-100 (half pot). You have top set, 
an extremely strong hand. However, this is a dry 
board with no draws. Betting too much might scare 
away worse hands. A half-pot bet looks like a 
continuation bet and can get called by pairs or 
ace-high. You want to build the pot gradually."
```

**Example 3: Bluff Spot**
```
Situation: You have 8♣7♣, river is K♠ Q♥ 10♦ 3♠ 2♥
Pot: $400, Checked to you, Your stack: $800

Advice: "Consider betting $250-300. You have nothing, 
but your opponent checked the river showing weakness. 
The board has a scary straight possibility (J-9 makes 
the nuts). A 2/3 pot bet represents a strong hand and 
may get better hands to fold. However, be prepared to 
give up if called - you have no showdown value."
```

## Technical Implementation

### Gemini Integration

**API**: Google Generative AI (Gemini)
**Model**: gemini-pro
**Configuration**:
- Temperature: 0.7 (balanced creativity/accuracy)
- Max tokens: Sufficient for detailed responses
- Safety settings: Default

### Context Building

**Prompt Structure**:
```typescript
You are an expert poker coach...

Current Game State:
- Your cards: [K♥ Q♥]
- Community cards: [A♥ 7♥ 2♠]
- Pot: $200
- Current bet: $100
- Your stack: $1,500
- Position: Button
- Players in hand: 3

Recent actions:
- Player 1 checks
- Player 2 bets $100
- Your turn

Question: [User's question or auto-advice request]
```

### Response Processing

**Steps**:
1. Gather game state
2. Format context for AI
3. Send to Gemini API
4. Receive response
5. Parse and format
6. Display in chat
7. Log interaction

### Error Handling

**API Errors**:
- Network timeout: Retry with exponential backoff
- Rate limit: Queue requests
- Invalid response: Show user-friendly error

**Fallback Behavior**:
- If AI unavailable: Show basic advice
- If context incomplete: Request clarification
- If question unclear: Ask for more details

### Performance Optimization

**Caching**:
- Common questions cached
- Game state snapshots
- Response templates

**Lazy Loading**:
- AI initialized on first use
- Reduces initial load time

**Debouncing**:
- Input debounced to prevent spam
- Multiple requests queued

## Best Practices

### For Players

**Getting Better Advice**:
1. Be specific in questions
2. Provide context if needed
3. Ask "why" to learn reasoning
4. Try different scenarios
5. Compare advice to your thinking

**Using Auto-Advice**:
1. Start with it ON to learn
2. Turn OFF to test yourself
3. Toggle based on situation
4. Use for difficult spots

**Learning Effectively**:
1. Read full explanations
2. Ask follow-up questions
3. Apply advice to future hands
4. Review action history
5. Identify patterns

### For Developers

**Extending the System**:
1. Add new prompt templates
2. Enhance context gathering
3. Improve response formatting
4. Add quick prompt categories
5. Implement feedback system

**Monitoring Quality**:
1. Track response times
2. Log user satisfaction
3. Identify common questions
4. Analyze advice accuracy
5. A/B test prompts

## Future Enhancements

### Planned Features
- **Hand Range Analysis**: Show opponent's likely hands
- **Equity Calculator**: Real-time win probability
- **GTO Suggestions**: Game theory optimal plays
- **Exploit Recommendations**: Adjust for opponent tendencies
- **Multi-Language Support**: Advice in multiple languages
- **Voice Input**: Ask questions via voice
- **Hand Replay**: Review past hands with AI analysis

### Advanced Features
- **Training Modes**: Specific scenario practice
- **Quiz Mode**: Test knowledge with AI questions
- **Progress Tracking**: Monitor improvement over time
- **Custom Coaching**: Personalized advice based on play style
- **Video Analysis**: Learn from recorded sessions
- **Tournament Coach**: ICM and bubble factor advice

## Troubleshooting

### Common Issues

**Advice Not Appearing**:
- Check auto-advice toggle
- Verify it's your turn
- Ensure network connection
- Check browser console for errors

**Slow Responses**:
- Network latency
- API rate limiting
- Complex game state
- Try refreshing page

**Irrelevant Advice**:
- Verify game state is correct
- Check if cards displayed properly
- Report bug if persistent

**Chat Not Scrolling**:
- Hover over panel to show scrollbar
- Click in panel to focus
- Check for browser issues

## Support

For issues or suggestions:
- Check documentation
- Review common questions
- Submit bug report
- Request feature enhancement

