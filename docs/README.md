# ICPoker Trainer - Documentation

This directory contains all project documentation, specifications, and investigation reports.

---

## Directory Structure

```
docs/
├── specs/              # Project specifications and requirements
│   └── tasks.md       # Complete task list for MVP implementation
│
└── investigation/      # Analysis, summaries, and review documents
    ├── poker_trainer_mvp_plan.md         # Original MVP planning document
    ├── task_2.1_summary.md               # Phase 2.1 implementation summary
    ├── tasks_2.2-2.7_summary.md          # Phase 2.2-2.7 implementation summary
    ├── phase1_review_complete.md         # Phase 1 review and test coverage
    ├── phase1_test_review_summary.md     # Detailed Phase 1 test analysis
    └── project_restructure_summary.md    # Project reorganization documentation
```

---

## Key Documents

### 📋 Specifications

#### [`specs/tasks.md`](specs/tasks.md)
**Complete MVP Task List** - The authoritative source for all project tasks, organized by phase:
- **Phase 1**: Core Game Engine (8 tasks) ✅ Complete
- **Phase 2**: AI Opponents (7 tasks) ✅ Complete  
- **Phase 3**: AI Coach (TBD)
- **Phase 4**: UI/UX Polish (TBD)

Each task includes:
- Description
- Success criteria
- Implementation status
- Test coverage references

---

### 📊 Investigation & Analysis

#### [`investigation/poker_trainer_mvp_plan.md`](investigation/poker_trainer_mvp_plan.md)
**Original MVP Planning Document** - Initial project scope, architecture decisions, and feature planning.

#### [`investigation/phase1_review_complete.md`](investigation/phase1_review_complete.md)
**Phase 1 Review Summary** - Executive summary of Phase 1 completion:
- All 8 tasks completed
- 74 unit tests (97.3% pass rate)
- Implementation verification
- Next steps

#### [`investigation/phase1_test_review_summary.md`](investigation/phase1_test_review_summary.md)
**Detailed Phase 1 Test Analysis** - Comprehensive test coverage report:
- Test-by-test breakdown
- Coverage analysis by task
- Test strategies and patterns
- Known issues and recommendations

#### [`investigation/task_2.1_summary.md`](investigation/task_2.1_summary.md)
**Task 2.1 Implementation** - Hand strength evaluation for AI:
- Preflop hand tiers
- Post-flop strength evaluation
- 48 tests covering 33+ hand combinations

#### [`investigation/tasks_2.2-2.7_summary.md`](investigation/tasks_2.2-2.7_summary.md)
**Tasks 2.2-2.7 Implementation** - Complete AI opponent system:
- Position awareness
- AI decision making
- Bet sizing logic
- Aggressive factor
- Playing style
- Turn management
- 78 tests covering all AI behaviors

#### [`investigation/project_restructure_summary.md`](investigation/project_restructure_summary.md)
**Project Reorganization** - Documentation of structural improvements:
- Source files moved to `src/`
- Test directories consolidated
- Import paths updated
- Before/after comparison

---

## Quick Navigation

### By Phase

| Phase | Status | Documentation |
|-------|--------|---------------|
| Phase 1: Core Engine | ✅ Complete | [Review](investigation/phase1_review_complete.md), [Tests](investigation/phase1_test_review_summary.md) |
| Phase 2: AI Opponents | ✅ Complete | [Task 2.1](investigation/task_2.1_summary.md), [Tasks 2.2-2.7](investigation/tasks_2.2-2.7_summary.md) |
| Phase 3: AI Coach | 🔵 Planned | [Task List](specs/tasks.md#phase-3) |
| Phase 4: UI/UX | 🔵 Planned | [Task List](specs/tasks.md#phase-4) |

### By Topic

| Topic | Document |
|-------|----------|
| **Project Overview** | [MVP Plan](investigation/poker_trainer_mvp_plan.md) |
| **All Tasks** | [tasks.md](specs/tasks.md) |
| **Test Coverage** | [Phase 1 Tests](investigation/phase1_test_review_summary.md) |
| **AI Implementation** | [Task 2.1](investigation/task_2.1_summary.md), [Tasks 2.2-2.7](investigation/tasks_2.2-2.7_summary.md) |
| **Project Structure** | [Restructure Summary](investigation/project_restructure_summary.md) |

---

## Project Status

### Completed ✅

- [x] Phase 1: Core Game Engine (8/8 tasks)
  - State management with Zustand
  - Deck management
  - Hand initialization
  - Betting round logic
  - Game phase progression
  - Hand evaluation (pokersolver)
  - Winner determination
  - Hand reset
  - **74 unit tests (97.3% pass rate)**

- [x] Phase 2: AI Opponents (7/7 tasks)
  - Hand strength evaluation
  - Position awareness
  - Decision making algorithms
  - Bet sizing strategies
  - Aggressive factor
  - Playing style variations
  - Turn management
  - **78 unit tests (100% pass rate)**

### In Progress 🔄

- Phase 3: AI Coach (Not started)

### Planned 📅

- Phase 4: UI/UX Polish

---

## Testing Documentation

### Test Files Location
All tests are in the `/tests` directory at project root.

### Test Summary

| Phase | Test Files | Tests | Pass Rate |
|-------|-----------|-------|-----------|
| Phase 1 | 4 files | 74 tests | 97.3% |
| Phase 2 | 2 files | 78 tests | 100% |
| **Total** | **6 files** | **152 tests** | **98.0%** |

### Running Tests

```bash
# All tests
npm test

# Phase 1 only
npm test -- tests/gameStore.test.ts tests/deck.test.ts tests/handEvaluator.test.ts tests/gameActions.test.ts

# Phase 2 only  
npm test -- tests/aiUtils.test.ts tests/aiBehavior.test.ts

# Specific test file
npm test -- tests/gameStore.test.ts

# Watch mode
npm test -- --watch
```

---

## Implementation Notes

### Architecture Decisions

1. **State Management**: Zustand (lightweight, simple API)
2. **Hand Evaluation**: pokersolver library (battle-tested)
3. **Testing**: Vitest (fast, ESM-native)
4. **Structure**: Standard React/TypeScript organization

### Code Organization

```
src/
├── components/     # React UI components
├── store/          # Zustand state management
├── utils/          # Game logic and AI
├── services/       # External services (Gemini)
└── types/          # TypeScript definitions

tests/              # All unit tests
docs/               # This directory
```

### Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Vite** - Build tool
- **Vitest** - Testing framework
- **pokersolver** - Hand evaluation
- **Tailwind CSS** - Styling

---

## Contributing

When adding new documentation:

1. **Specifications** → Add to or reference `specs/tasks.md`
2. **Implementation summaries** → Add to `investigation/` with descriptive filename
3. **Update this README** to include the new document in the appropriate section

### Documentation Standards

- Use Markdown (.md) format
- Include table of contents for documents > 100 lines
- Use clear headings and structure
- Include code examples where relevant
- Update task status in `specs/tasks.md` when completing work

---

## Version History

| Date | Event | Document |
|------|-------|----------|
| Oct 25, 2025 | Phase 1 Review Complete | [phase1_review_complete.md](investigation/phase1_review_complete.md) |
| Oct 25, 2025 | Phase 1 Tests Added | [phase1_test_review_summary.md](investigation/phase1_test_review_summary.md) |
| Oct 25, 2025 | Project Restructured | [project_restructure_summary.md](investigation/project_restructure_summary.md) |
| Oct 25, 2025 | Task 2.1 Complete | [task_2.1_summary.md](investigation/task_2.1_summary.md) |
| Oct 25, 2025 | Tasks 2.2-2.7 Complete | [tasks_2.2-2.7_summary.md](investigation/tasks_2.2-2.7_summary.md) |

---

## External Resources

- [Poker Rules](https://en.wikipedia.org/wiki/Texas_hold_%27em)
- [pokersolver Library](https://github.com/goldfire/pokersolver)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vitest Documentation](https://vitest.dev/)
- [React Documentation](https://react.dev/)

---

**Last Updated**: October 25, 2025  
**Project Status**: Phase 2 Complete, Phase 3 Next  
**Test Coverage**: 152 tests, 98.0% pass rate

