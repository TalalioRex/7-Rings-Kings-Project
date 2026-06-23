# Codex Implementation Prompt: Upgrade Slot Machine Logic and Interface

Project path:

```text
C:\Users\talayeh.ghofrani_gam\Projects\7 Rings, Kings Project
```

You are working on a Next.js / React / TypeScript fake-money slot prototype called **7 Rings 7 Kings**. The playable slot mode is **7 Rings 7 Kings: A Very Suspicious 7-Eleven**. This is a creative demo only. Do not add real-money gambling, deposits, withdrawals, payments, wallets, casino certification claims, or regulated gambling language.

## Goal

Upgrade the existing slot machine so it feels and behaves more like a real modern video slot machine.

Implement:

1. More realistic slot spin logic using reel strips.
2. Clear jackpot logic.
3. A simple RTP simulation script.
4. A more accurate slot-machine cabinet/interface.
5. Paytable/help clarity for win, wild, scatter, free-spin, and jackpot rules.

## Existing Research Brief

Read this file first:

```text
Roadmap/slot-machine-logic-interface-research.md
```

Key references from that research:

- Slot machine mechanics: https://en.wikipedia.org/wiki/Slot_machine
- Pay tables: https://en.wikipedia.org/wiki/Pay_table
- Progressive jackpots: https://en.wikipedia.org/wiki/Progressive_jackpot
- Formal slot modelling/RTP: https://arxiv.org/abs/2407.06809
- UI/animation reference: https://github.com/johakr/html5-slot-machine
- RTP/math references:
  - https://github.com/aam263/Slot-Machine-Lines-Evaluator
  - https://github.com/Akubet/RTPsim

## Important Product Direction

The current game should remain:

- Fake-money only.
- Browser-based.
- Local demo balance only.
- Transparent game math in source code.
- No claims of regulated randomness, certification, casino compliance, or real-money readiness.

## Current App Shape

Likely important files:

```text
src/lib/symbols.ts
src/lib/slotEngine.ts
src/lib/paylines.ts
src/lib/gameConfig.ts
src/components/SlotMachine.tsx
src/components/SlotMachineFrame.tsx
src/components/ReelGrid.tsx
src/components/GameControls.tsx
src/components/PaytableModal.tsx
src/components/WinDisplay.tsx
src/app/globals.css
```

Use the repo's existing conventions and Tailwind styling.

## Required Logic Upgrade

### 1. Replace independent weighted tile generation with reel strips

Currently, the app likely picks each visible tile independently from global symbol weights. Change this to a more realistic model:

- Define 5 reel strips, one array per reel.
- A spin picks one stop index per reel.
- The visible 3 rows come from `stop - 1`, `stop`, `stop + 1`, with wraparound.
- Keep the visible grid shape as 5 reels x 3 rows.

Suggested types:

```ts
type ReelStrip = string[];
type ReelSet = [ReelStrip, ReelStrip, ReelStrip, ReelStrip, ReelStrip];
```

Create something like:

```text
src/lib/reelStrips.ts
```

The reel strips should contain symbol IDs from `src/lib/symbols.ts`.

### 2. Preserve payline behavior but make it more explicit

Rules:

- Pay left-to-right.
- Evaluate one position per reel for each payline.
- Highest valid line match pays.
- Wild substitutes for regular symbols.
- Wild does not substitute for scatter or jackpot symbols.
- Scatter pays anywhere and triggers free spins.
- Jackpot should require natural jackpot symbols, no wild substitution.

### 3. Add jackpot logic

Add a local progressive jackpot:

- Seed value: choose a clear demo value, for example `10000` demo coins.
- Contribution rate: add a small percentage of each paid spin, for example `1%` of bet.
- Trigger: 5 natural jackpot symbols on an active payline, preferably the center line or any active payline. Choose one and document it in the paytable.
- On hit: pay the current jackpot meter, reset the jackpot to seed.
- Persist jackpot meter in localStorage.

If a dedicated jackpot symbol does not exist yet, use the highest-value theme symbol or add a symbol ID such as `seven-rings-jackpot` with a styled fallback until art exists.

### 4. Add an RTP simulation script

Create a local script that can simulate spins without React.

Suggested path:

```text
scripts/simulateSlots.ts
```

or plain JS if easier with the existing toolchain.

Add an npm script:

```json
"simulate:slots": "tsx scripts/simulateSlots.ts"
```

If adding `tsx` is too much dependency churn, use a plain TypeScript-compatible JS script or compile-safe approach already available in the project.

The simulator should output:

- Spin count
- Total bet
- Total paid
- RTP percentage
- Hit frequency
- Free-spin trigger frequency
- Jackpot hit count/frequency
- Biggest win
- Average paid win

Default run should be reasonable, like 100,000 spins. Allow an argument for 1,000,000 if practical.

### 5. Interface upgrade

Make the UI feel more like a real slot cabinet.

Add or improve:

- Top jackpot marquee with animated/displayed jackpot meter.
- Cabinet frame with top sign, reel bay, side lights, and bottom control deck.
- Machine meters: CREDIT, BET, WIN, LINES, JACKPOT.
- Large round SPIN button on lower right.
- Smaller buttons/icons for paytable, settings, turbo/fast spin, sound, back/modes.
- Payline markers along the left/right sides of the reel window.
- Staggered reel stop animation: reel 1 stops first, then 2, 3, 4, 5.
- Win roll-up/count-up animation for the WIN meter.
- Free-spin mode visual state.
- Jackpot hit visual state.

Do not make it a marketing landing page. The first screen should remain the playable slot experience.

## Visual Style Direction

Use the existing 7 Rings / Aisle 7 neon fantasy style, but make the machine structure more authentic:

- Less generic panel layout.
- More cabinet-like silhouette.
- Strong jackpot meter on top.
- Clear control deck at bottom.
- Reels should feel like actual reel windows, not just tiles in a grid.
- Avoid clutter and overlapping text.
- Make the layout responsive.

## Paytable Modal Upgrade

The paytable should clearly show:

- Each symbol payout for 3/4/5 matches.
- Wild substitution rules.
- Scatter/free-spin rules.
- Jackpot trigger and reset behavior.
- Demo-only language.

## Verification Required

Run:

```bash
npm run typecheck
npm run build
```

Also run the slot simulator and report the observed demo RTP / hit frequency.

If a local dev server is needed, start it and provide the URL.

## Deliverable Summary

At the end, summarize:

- Files changed.
- New slot logic behavior.
- Jackpot behavior.
- Simulator output.
- Verification commands and results.
- Any follow-up tuning recommendations.
