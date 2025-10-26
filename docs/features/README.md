# ICPoker Trainer Features Documentation

## Overview
This directory contains comprehensive documentation for all features of the ICPoker Trainer application. Each document provides in-depth technical details, usage instructions, and implementation notes.

## Feature Documents

### Core Features

#### [Game Mechanics](./GAME_MECHANICS.md)
Complete guide to poker gameplay, betting rounds, hand evaluation, and game flow.

**Topics Covered**:
- Table configuration and seating
- Betting rounds and phases
- Player actions (fold, call, raise, check)
- Pot management and side pots
- Hand evaluation and rankings
- Game flow and lifecycle
- Position awareness
- Winner determination

#### [AI Coach System](./AI_COACH_SYSTEM.md)
Detailed documentation of the AI-powered coaching assistant.

**Topics Covered**:
- Real-time advice system
- Action tracking and history
- Question & answer functionality
- Auto-advice mode
- Context awareness
- Gemini AI integration
- Best practices for learning

#### [User Interface](./USER_INTERFACE.md)
Comprehensive UI/UX documentation covering all interface elements.

**Topics Covered**:
- Layout structure
- Header and navigation
- Game info panel
- Poker table display
- AI coach panel
- Action controls
- Visual design system
- Responsive design
- Accessibility features

#### [AI Playing Styles](./AI_PLAYING_STYLES.md)
In-depth analysis of AI opponent behaviors and strategies.

**Topics Covered**:
- 8 distinct playing styles
- Style characteristics (VPIP, PFR, aggression)
- Pre-flop and post-flop decision making
- Bet sizing patterns
- Position awareness
- How to exploit each style
- Strategy recommendations

#### [ICP Cycles Economy](./ICP_CYCLES_ECONOMY.md)
Complete guide to the cycles-based payment system.

**Topics Covered**:
- ICP to cycles conversion
- Game economy (1T cycles = 100 hands)
- Cost per hand (10B cycles)
- UI display and tracking
- Exchange rates and updates
- Technical implementation
- Future enhancements

#### [Cycles Implementation](./CYCLES_IMPLEMENTATION_SUMMARY.md)
Technical implementation details of the cycles system.

**Topics Covered**:
- Files created and modified
- Utility functions
- State management
- UI integration
- Testing recommendations
- Success metrics

## Quick Reference

### For Players

**Getting Started**:
1. Read [Game Mechanics](./GAME_MECHANICS.md) for poker rules
2. Review [User Interface](./USER_INTERFACE.md) for UI navigation
3. Learn [AI Coach System](./AI_COACH_SYSTEM.md) for training tips
4. Study [AI Playing Styles](./AI_PLAYING_STYLES.md) to beat opponents

**Improving Your Game**:
- Use AI Coach for real-time advice
- Study opponent playing styles
- Practice different positions
- Review action history
- Ask strategic questions

**Managing Cycles**:
- Check [ICP Cycles Economy](./ICP_CYCLES_ECONOMY.md) for pricing
- Monitor hands left in UI
- Top up before running out
- Understand cost per hand

### For Developers

**Understanding the Codebase**:
1. Start with [Game Mechanics](./GAME_MECHANICS.md) for game logic
2. Review [User Interface](./USER_INTERFACE.md) for component structure
3. Study [AI Coach System](./AI_COACH_SYSTEM.md) for AI integration
4. Read [Cycles Implementation](./CYCLES_IMPLEMENTATION_SUMMARY.md) for economy system

**Key Technical Areas**:
- **State Management**: Zustand store (`store/gameStore.ts`)
- **Game Logic**: `utils/gameActions.ts`
- **AI Logic**: `utils/aiUtils.ts`, `utils/playingStyles.ts`
- **UI Components**: `components/` directory
- **Types**: `types/index.ts`

**Adding Features**:
- Follow existing patterns
- Update relevant documentation
- Add tests for new functionality
- Consider UI/UX impact
- Update this README

## Feature Status

### ✅ Implemented
- [x] Core poker gameplay
- [x] AI opponents with distinct styles
- [x] AI coaching system
- [x] Cycles economy
- [x] Linear table layout
- [x] Real-time action tracking
- [x] Hand evaluation
- [x] Side pot calculation
- [x] Position awareness
- [x] Auto-advance between hands

### 🚧 In Progress
- [ ] Wallet integration
- [ ] Cycles purchase flow
- [ ] Hand replay system
- [ ] Statistics tracking

### 📋 Planned
- [ ] Tournament mode
- [ ] Multi-table support
- [ ] Hand range analysis
- [ ] GTO solver integration
- [ ] Mobile app
- [ ] Multiplayer mode

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Hand Evaluation**: pokersolver library
- **Testing**: Vitest
- **Build**: Vite

### Project Structure
```
icpoker-trainer/
├── src/
│   ├── components/      # React components
│   ├── store/          # Zustand store
│   ├── utils/          # Game logic & utilities
│   ├── hooks/          # Custom React hooks
│   ├── services/       # External services (AI)
│   └── types/          # TypeScript types
├── tests/              # Test files
├── docs/
│   ├── features/       # Feature documentation (you are here)
│   └── specs/          # Requirements & specs
└── public/             # Static assets
```

### Data Flow
```
User Action
    ↓
Action Controls Component
    ↓
Zustand Store Action
    ↓
Game Logic Utility
    ↓
State Update
    ↓
UI Re-render
    ↓
AI Coach Update (if applicable)
```

## Contributing

### Documentation Standards
- Use Markdown format
- Include code examples
- Add visual diagrams where helpful
- Keep sections organized with TOC
- Update README when adding new docs

### When to Update Docs
- New feature added
- Existing feature modified
- Bug fix that changes behavior
- UI/UX changes
- API changes

### Documentation Checklist
- [ ] Feature overview written
- [ ] Technical details documented
- [ ] Usage examples provided
- [ ] Edge cases covered
- [ ] Screenshots/diagrams added (if applicable)
- [ ] README updated
- [ ] Related docs cross-referenced

## Support & Resources

### Internal Resources
- [MVP Plan](../specs/mvp_plan.md) - Original product requirements
- [Tasks](../specs/tasks.md) - Development task list
- [Verification Tests](../specs/verify.md) - Test scenarios

### External Resources
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Gemini AI](https://ai.google.dev/)
- [Internet Computer](https://internetcomputer.org/)

### Community
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Pull Requests: Contribute code
- Documentation PRs: Improve docs

## Changelog

### Recent Updates
- **2025-10-25**: Created comprehensive feature documentation
- **2025-10-25**: Added cycles economy system
- **2025-10-25**: Implemented linear table layout
- **2025-10-25**: Enhanced AI coach panel
- **2025-10-25**: Added seat numbers and player ordering

### Version History
- **v0.3.0**: Cycles economy integration
- **v0.2.0**: AI coach enhancements
- **v0.1.0**: Initial MVP release

## License
[Add license information]

## Contact
[Add contact information]

