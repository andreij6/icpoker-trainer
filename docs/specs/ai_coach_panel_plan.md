# AI Coach Panel Redesign Plan

This file outlines required changes and suggested enhancements for the AI Coach panel. The intent is to streamline the UI and consolidate all decision-support context in one place.

## Must-Implement Changes

1) Automatic Advice Toggle
- Add a checkbox: "Automatically show advice on my turn".
- If checked: when it becomes the user's turn, fetch and show advice automatically.
- If unchecked: no automatic fetch; advice appears only on manual request.
- Persist preference in localStorage (default ON for first-time users).

2) Always-visible History (Latest → Oldest)
- Remove collapsible History. Show a scrollable list ordered newest first.
- Show entries for: Advice (AI), Questions (User), Feedback (AI), and AI Action updates (see 3).
- Each entry includes timestamp + compact type tag.

3) Inline AI Player Actions (no toasts)
- Stop using toast notifications for player actions.
- Append messages like: "Player 4 raises to $150" into the panel stream with lighter styling than advice.

4) Simplified Header
- Remove title "AI Coach" and subtitle.
- Header starts with: [Get Advice] and the auto-advice checkbox aligned right.
- Optional helper text only before first advice appears.

## Interaction Notes
- Get Advice: always triggers a request immediately.
- Auto-advice (if enabled): debounce 300–750ms on turn change to avoid flicker.
- Errors/timeouts: inline message (no modals/toasts).
- Show small inline spinner while a request is pending.

## Data & State
- New UI state
  - `autoAdviceEnabled: boolean` (persisted)
  - `isRequestPending: boolean`
- Message stream
  - Add type `action` alongside `advice | question | feedback`.
  - Shape:
```ts
export type CoachMessageType = 'advice' | 'question' | 'feedback' | 'action';
export interface CoachMessage {
  id: string;
  type: CoachMessageType;
  author: 'AI' | 'User' | 'System';
  text: string;
  createdAt: number;
}
```

## Layout & Visuals
- Header row: [Get Advice]  [ ] Automatically show advice on my turn
- Latest Advice card (if present) shown above the stream
- Stream list: compact rows, newest first
  - Advice: green accent
  - Question: neutral
  - Feedback: yellow accent
  - Action: gray accent

## Accessibility
- Checkbox + button keyboard-accessible, labeled
- ARIA live region for new stream messages

---

## Suggested Improvements (for review)
1) Quick Prompts per phase (chips: "Should I call preflop?", "Pot odds?") - yes
2) Structured advice response (Action, Why, Key factors) for scannability - yes
3) Hand snapshot with each advice (position, pot, to call, risk) - yes
4) Thumbs up/down on advice with optional comment (local only) - no
5) Phase-grouping (collapse older phase messages under headers) - no
6) Turn reminder bar when auto is OFF (no toasts) - no
7) Export session notes (copy/share) - no
8) Gentle rate-limit backoff with inline countdown - no

---

## High-level Implementation Steps
1) Add `autoAdviceEnabled` to coaching hook (persist via localStorage)
2) Update AIAssistant header (remove title; add checkbox)
3) Replace collapsible history with a single scrollable stream (newest first)
4) Route AI action events to the coach stream; disable action toasts
5) Debounce auto-advice on user's turn; keep manual button unchanged
6) Add ARIA live region + inline spinner handling
7) QA: turn transitions, ordering, long histories, persistence
