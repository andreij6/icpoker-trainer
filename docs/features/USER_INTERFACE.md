# User Interface

## Overview
ICPoker Trainer features a modern, intuitive interface designed for optimal poker training. The UI emphasizes clarity, real-time updates, and minimal distractions while providing all necessary information at a glance.

## Table of Contents
- [Layout Structure](#layout-structure)
- [Header](#header)
- [Game Info Panel](#game-info-panel)
- [Poker Table](#poker-table)
- [AI Coach Panel](#ai-coach-panel)
- [Action Controls](#action-controls)
- [Visual Design](#visual-design)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)

## Layout Structure

### Overall Layout

```
┌─────────────────────────────────────────────────┐
│              HEADER                             │
├───────────────────┬─────────────────────────────┤
│                   │                             │
│   AI COACH        │     POKER TABLE             │
│   PANEL           │                             │
│                   │                             │
├───────────────────┴─────────────────────────────┤
│           GAME INFO PANEL                       │
├─────────────────────────────────────────────────┤
│           ACTION CONTROLS                       │
└─────────────────────────────────────────────────┘
```

### Component Hierarchy
1. **Header** (Top)
2. **Main Content** (Middle)
   - AI Coach Panel (Left)
   - Poker Table (Right)
3. **Game Info Panel** (Below main content)
4. **Action Controls** (Bottom)

### Dimensions
- **Total Height**: ~700px (adjustable by breakpoint)
- **Header**: ~60px
- **Main Content**: ~520-700px
- **Game Info Panel**: ~80px
- **Action Controls**: ~60-100px

## Header

### Components

```
┌─────────────────────────────────────────────────┐
│ [ICP Logo] ICPoker Trainer    [Top Up] [Wallet]│
└─────────────────────────────────────────────────┘
```

### Elements

#### Logo & Title
- **ICP Logo**: Internet Computer Protocol icon
- **Title**: "ICPoker Trainer"
- **Position**: Left side
- **Styling**: White text, bold font

#### Top Up Button
- **Purpose**: Add cycles to account
- **Appearance**: Semi-transparent white background
- **State**: Always visible
- **Action**: Opens cycles purchase flow (future)

#### Wallet Connection
- **Display**: Truncated wallet address (e.g., "a1b2...c3d4")
- **Icon**: Wallet symbol
- **State**: Connected/Disconnected
- **Action**: Manage wallet connection (future)

### Styling
- **Background**: Dark with subtle border
- **Height**: 60px
- **Padding**: 24px horizontal
- **Border**: Bottom border for separation

## Game Info Panel

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Pot: $125 │ Phase │ Players │ Your Hand │ Cycles │ Hands │ Winner│
└──────────────────────────────────────────────────────────────────┘
```

### Information Sections

#### Current Pot
- **Label**: "Current Pot" or "Main Pot"
- **Value**: Dollar amount (e.g., "$125")
- **Size**: Large, bold text
- **Color**: White
- **Side Pots**: Listed below if present
  - Format: "Side 1: $50"
  - Color: Yellow

#### Game Phase
- **Label**: "Game Phase"
- **Value**: Current phase name
- **Options**:
  - "Waiting to Start"
  - "Pre-Flop"
  - "FLOP"
  - "TURN"
  - "RIVER"
  - "Hand Complete"
- **Styling**: Uppercase, bold

#### Players in Hand
- **Label**: "Players"
- **Value**: Number of active players
- **Format**:
  - 2 players: "Heads Up"
  - 3 players: "3-Handed"
  - 4+ players: "X-Handed"
- **Updates**: Real-time as players fold

#### Your Hand
- **Label**: "Your Hand"
- **Value**: Hand description
- **Pre-Flop Examples**:
  - "A-K suited"
  - "Pair of Queens"
  - "7-2 offsuit"
- **Post-Flop Examples**:
  - "Ace High"
  - "Pair of Kings"
  - "Two Pair, Aces and Sixes"
  - "Flush, King High"
  - "Full House, Tens over Fives"

#### Cycles Balance
- **Label**: "Cycles"
- **Value**: Formatted cycles (e.g., "10.0T", "9.5T")
- **Format**:
  - Trillions: "X.XT"
  - Billions: "X.XB"
  - Millions: "X.XM"
- **Color**: White

#### Hands Left
- **Label**: "Hands Left"
- **Value**: Number of hands remaining
- **Calculation**: Cycles ÷ 10 billion
- **Color**: 
  - White: 10+ hands
  - Red: < 10 hands (warning)

#### Last Winner
- **Label**: "Last Winner"
- **Value**: Winner's name
- **Sub-value**: Winning hand type
- **Display**: Only shown after first hand
- **Position**: Right side of panel

### Visual Design
- **Background**: Gradient (green-900 to green-800)
- **Border**: Yellow/gold accent
- **Dividers**: Vertical lines between sections
- **Height**: 80px
- **Padding**: 16px

### Winner Display

When hand completes, panel transforms:

```
┌──────────────────────────────────────────────────┐
│          🏆  Winner: Sarah  🏆                   │
│              Full House, Kings over Fives        │
│                  [Next Hand (3s)]                │
└──────────────────────────────────────────────────┘
```

- **Background**: Yellow/gold gradient
- **Trophy Icons**: Flanking winner name
- **Countdown**: 3-second auto-advance
- **Button**: Manual advance option

## Poker Table

### Linear Layout

```
┌─────────────────────────────────────────────────┐
│                  Pot: $125                      │
│                    FLOP                         │
│           [A♠] [K♠] [Q♠] [□] [□]              │
│   ═══════════════ ● ◉ ● ═══════════════        │
│                                                 │
│ [You]  [AI-2]  [AI-3]  [AI-4]  [AI-5]  [AI-6]│░
│ Seat1  Seat2   Seat3   Seat4   Seat5   Seat6 │░
└─────────────────────────────────────────────────┘
```

### Community Cards Section

#### Pot Display
- **Position**: Top center
- **Size**: 3xl font (48px)
- **Color**: White with drop shadow
- **Format**: "$X,XXX"

#### Game Phase Label
- **Position**: Below pot
- **Size**: Small text
- **Color**: White/70% opacity
- **Transform**: Uppercase

#### Card Area
- **Height**: Fixed 224px (prevents layout shift)
- **Cards**: 5 positions (Flop 1-3, Turn, River)
- **Face-Up**: XL size (160px × 224px)
- **Face-Down**: XL size (same dimensions)
- **Spacing**: 16px gap between cards

#### Stylish Divider
- **Design**: Horizontal line with center ornament
- **Color**: Amber/gold gradient
- **Ornament**: Three dots (small-large-small)
- **Animation**: Pulsing effect on side dots
- **Purpose**: Separates cards from players

### Player Cards Section

#### Horizontal Row
- **Layout**: Scrollable horizontal flex
- **Overflow**: Hidden with gradient peek
- **Peek Effect**: 80px gradient fade on right
- **Purpose**: Indicates more players off-screen

#### Player Card Structure

```
┌─────────────────┐
│   [K♥] [Q♥]    │ ← Cards (112px tall)
│                 │
│    [D] [SB]     │ ← Badges
│    Seat 3       │ ← Seat number
│   Sarah         │ ← Name
│   Calls: $50    │ ← Action
│   $2,450        │ ← Stack
└─────────────────┘
```

**Card Elements**:
1. **Player Cards**: 2 cards (medium size: 80px × 112px)
   - User: Face-up
   - AI: Face-down (blue back)
   - Folded: Empty space (maintains height)

2. **Badges**: Dealer/Blind indicators
   - D: White circle, yellow border
   - SB/BB: Blue circle, white text
   - Height: 20px

3. **Seat Number**: "Seat X"
   - Color: White/60% opacity
   - Size: 12px
   - Position: Above name

4. **Player Name**: Display name
   - Color: White
   - Size: 14px
   - Weight: Bold

5. **Action/Status**: Last action or "Folded"
   - Calls/Bet: Yellow text
   - Folded: Gray text
   - Size: 12px

6. **Chip Stack**: Dollar amount
   - Active: Green text
   - Folded: Gray text
   - Format: "$X,XXX"

#### Player Card States

**Active Player**:
- Border: Yellow with glow
- Opacity: 100%
- Cards: Visible

**Inactive Player**:
- Border: Green/50%
- Opacity: 100%
- Cards: Visible

**Folded Player**:
- Border: Green/50%
- Opacity: 50%
- Grayscale: Applied
- Cards: Hidden (space maintained)
- Position: Moved to end of row

**User Player**:
- Position: Always first (leftmost)
- Cards: Always face-up
- Never moves when folded

### Player Ordering Logic

**Active Play**:
1. User (Seat 1)
2. Current/Next AI player
3. Other active AI players (turn order)
4. Folded AI players (original order)

**Example Progression**:
```
Start: [You] [AI-2] [AI-3] [AI-4] [AI-5]

AI-2 folds:
[You] [AI-3] [AI-4] [AI-5] [AI-2✗]

You fold:
[You✗] [AI-3] [AI-4] [AI-5] [AI-2✗]
```

## AI Coach Panel

### Panel Structure

```
┌─────────────────────────────────┐
│ ○ Auto-advice on my turn        │ ← Toggle
├─────────────────────────────────┤
│                                 │
│ Dealer starts a new hand        │
│ You are in middle position      │
│ < Sarah raises to $100          │
│ > You called $100               │ ← Messages
│ ...                             │   (scrollable)
│                                 │
├─────────────────────────────────┤
│ [Ask a question...    ] [Send] │ ← Input
└─────────────────────────────────┘
```

### Components

#### Auto-Advice Toggle
- **Type**: Modern toggle switch
- **Label**: "Auto-advice on my turn"
- **Default**: ON
- **Persistence**: Saved to localStorage
- **Height**: 24px

#### Messages Area
- **Height**: Fixed 360px
- **Overflow**: Scroll (hidden scrollbar)
- **Scrollbar**: Visible on hover only
- **Auto-scroll**: To bottom on new message
- **Background**: Transparent

#### Message Types

**Advice Messages**:
```
┌─────────────────────────────────┐
│ Recommended Action: Call $50    │
│                                 │
│ Why: You have a strong drawing  │
│ hand with 9 outs...             │
└─────────────────────────────────┘
```
- Background: Subtle highlight
- Padding: 12px
- Border-radius: 8px

**Action Messages**:
```
< Sarah raises to $100          (AI, left)
> You called $100               (User, right)
      Dealer starts new hand    (System, center)
```
- **AI Actions**: Left-aligned
- **User Actions**: Right-aligned
- **Dealer Actions**: Center-aligned
- **Folds**: Gray color

**Question/Answer**:
```
> What are my pot odds?         (User question)
< Your pot odds are 3:1...      (AI answer)
```

#### Input Section
- **Type**: Textarea (2 lines)
- **Placeholder**: "Ask a question about poker..."
- **Resize**: None (fixed height)
- **Submit**: Enter key or Send button
- **Button**: 48px tall (matches textarea)

### Visual Design
- **Background**: Dark with 5% white overlay
- **Border**: White/10% opacity
- **Border-radius**: 12px
- **Total Height**: Fixed 520px
- **Prevents**: Layout jumping

## Action Controls

### Layout Options

#### Standard Layout (User's Turn)
```
┌─────────────────────────────────────────┐
│  [Fold]  [Call $50]  [Bet/Raise]       │
│  [Skip to Next Hand]                    │
└─────────────────────────────────────────┘
```

#### Bet Sizing Layout
```
┌─────────────────────────────────────────┐
│  [1/2 Pot] [Pot] [All In]              │
│  [────────────●──────────] [$150]      │
│  [Cancel]  [Raise to $150]             │
└─────────────────────────────────────────┘
```

#### Skip Only (Not User's Turn)
```
┌─────────────────────────────────────────┐
│        [Skip to Next Hand]              │
└─────────────────────────────────────────┘
```

### Button Specifications

#### Fold Button
- **Color**: Red (bg-red-900/80)
- **Border**: Red accent
- **Size**: flex-1 (equal width)
- **Height**: 48px
- **Text**: "Fold"
- **Hover**: Darker red
- **Disabled**: 50% opacity

#### Call/Check Button
- **Color**: White/10% (semi-transparent)
- **Border**: White/20%
- **Size**: flex-1
- **Height**: 48px
- **Text**: "Call $X" or "Check"
- **Dynamic**: Amount updates real-time
- **Hover**: White/20%

#### Bet/Raise Button
- **Color**: Primary (green)
- **Size**: flex-1
- **Height**: 48px
- **Text**: "Bet" or "Raise"
- **Action**: Opens sizing panel
- **Hover**: 90% opacity

#### Skip Button
- **Color**: White/10%
- **Border**: White/20%
- **Width**: 100% (full width)
- **Height**: 48px
- **Text**: "Skip to Next Hand"
- **Position**: Below main buttons
- **Visibility**: Conditional

### Bet Sizing Panel

#### Preset Buttons
- **Options**: "1/2 Pot", "Pot", "All In"
- **Layout**: Horizontal row
- **Size**: Equal width (flex-1)
- **Height**: 36px
- **Purpose**: Quick bet sizing

#### Slider
- **Range**: Min bet to stack size
- **Step**: $50 (Big Blind)
- **Special**: Pot-sized bets use exact amounts
- **Color**: Primary accent
- **Width**: Full width

#### Amount Display
- **Format**: "$X,XXX"
- **Width**: 112px
- **Background**: White/5%
- **Border**: White/10%
- **Updates**: Real-time with slider

#### Action Buttons
- **Cancel**: Returns to main controls
- **Raise/Bet**: Confirms action
  - Text: "Raise to $X" or "Bet $X"
  - Disabled: If amount invalid

### Button States

**Enabled**:
- Full color
- Cursor: Pointer
- Hover effects active

**Disabled**:
- 50% opacity
- Cursor: Not-allowed
- No hover effects
- Reasons:
  - Not user's turn
  - Insufficient stack
  - Invalid action

**Loading** (AI thinking):
- Buttons disabled
- Subtle animation (future)

## Visual Design

### Color Palette

**Primary Colors**:
- Background: Dark green (#0A1F1A)
- Primary: Bright green (#10B981)
- Accent: Gold/Yellow (#F59E0B)

**Text Colors**:
- Primary: White (#FFFFFF)
- Secondary: White/70% (#FFFFFFB3)
- Muted: White/60% (#FFFFFF99)
- Disabled: White/40% (#FFFFFF66)

**Status Colors**:
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Info: Blue (#3B82F6)

**Table Colors**:
- Table: Green gradient
- Border: Amber (#D97706)
- Cards: White background
- Card Back: Blue gradient

### Typography

**Font Family**: System font stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Font Sizes**:
- Heading 1: 48px (3xl)
- Heading 2: 32px (2xl)
- Heading 3: 24px (xl)
- Body: 16px (base)
- Small: 14px (sm)
- Tiny: 12px (xs)

**Font Weights**:
- Bold: 700
- Semibold: 600
- Normal: 400

### Spacing

**Padding**:
- Large: 32px (8)
- Medium: 16px (4)
- Small: 8px (2)
- Tiny: 4px (1)

**Gaps**:
- Large: 32px (8)
- Medium: 16px (4)
- Small: 12px (3)
- Tiny: 8px (2)

**Margins**:
- Section: 24px (6)
- Component: 16px (4)
- Element: 8px (2)

### Borders & Shadows

**Border Radius**:
- Large: 16px (xl)
- Medium: 12px (lg)
- Small: 8px (md)
- Tiny: 4px (sm)

**Box Shadows**:
- Elevated: 0 10px 25px rgba(0,0,0,0.3)
- Medium: 0 4px 12px rgba(0,0,0,0.2)
- Small: 0 2px 8px rgba(0,0,0,0.1)

**Borders**:
- Thick: 2px
- Normal: 1px
- Thin: 0.5px

## Responsive Design

### Breakpoints

**Extra Large (xl)**: ≥ 1280px
- Table height: 700px
- Card size: XL (160×224)
- Full layout

**Large (lg)**: ≥ 1024px
- Table height: 640px
- Card size: XL
- Adjusted spacing

**Medium (md)**: ≥ 768px
- Table height: 580px
- Card size: Large
- Compact layout

**Small (sm)**: < 768px
- Table height: 520px
- Card size: Medium
- Stacked layout

### Adaptive Features

**Layout Adjustments**:
- Panels stack on small screens
- Font sizes scale down
- Spacing reduces
- Buttons stack vertically

**Touch Optimization**:
- Larger touch targets (48px minimum)
- Increased spacing between buttons
- Swipe gestures (future)

## Accessibility

### Keyboard Navigation
- Tab: Navigate between controls
- Enter: Activate buttons
- Escape: Cancel actions
- Arrow keys: Adjust slider

### Screen Reader Support
- ARIA labels on buttons
- Role attributes on components
- Alt text on images
- Semantic HTML structure

### Visual Accessibility
- High contrast ratios
- Clear focus indicators
- No color-only information
- Readable font sizes

### Motion
- Reduced motion support (future)
- Optional animations
- Smooth transitions

## Performance

### Optimization Techniques
- Fixed heights prevent layout shift
- Lazy loading for heavy components
- Debounced inputs
- Memoized calculations
- Virtual scrolling for long lists

### Load Times
- Initial: < 2 seconds
- Interaction: < 100ms
- AI response: 1-3 seconds

## Future Enhancements

### Planned UI Improvements
- Dark/light theme toggle
- Customizable layout
- Resizable panels
- Card animation
- Sound effects
- Haptic feedback (mobile)
- Fullscreen mode
- Picture-in-picture (future)

