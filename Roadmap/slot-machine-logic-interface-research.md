# Slot Machine Logic and Interface Reference

Research date: 2026-06-21
Project: 7 Rings: Aisle 7 Jackpot / Cursed Reels
Scope: fake-money prototype only. This is not compliance guidance for real-money gambling.

## Best References Found

### Core slot-machine mechanics

- Slot machine overview: https://en.wikipedia.org/wiki/Slot_machine
  - Useful for terminology, cabinet conventions, paylines, wilds, scatters, free spins, volatility, virtual reels, RTP, and video slot conventions.
  - Key product lesson: modern video slots usually use 5 reels, 3+ rows, multiple paylines or ways-to-win, themed symbols, paytable/help, credit/bet/win meters, spin controls, free spins, bonus rounds, and strong win-count animations.

- Pay table overview: https://en.wikipedia.org/wiki/Pay_table
  - Useful for defining exactly what pays, where symbols must land, how paylines work, and how wilds interact with payline wins.
  - Product lesson: paytable must be visible in-game and should show symbols, 3/4/5-of-kind payouts, wild/scatter rules, jackpot trigger, and free-spin rules.

- Progressive jackpot overview: https://en.wikipedia.org/wiki/Progressive_jackpot
  - Useful for jackpot meter behavior.
  - Product lesson: jackpot can be fixed, progressive, local pooled, network pooled, or mystery/must-hit style. For our fake-money demo, use a local progressive meter that grows by a percentage of every paid spin and resets to a seed value when hit.

- Formal Modelling and Analysis of Slot Machines: https://arxiv.org/abs/2407.06809
  - Useful for thinking about RTP as a modelable system, especially when bonus rounds or player choices exist.
  - Product lesson: keep game math explicit and testable. If a bonus game adds choices, RTP analysis becomes more complex.

### Open-source references

- johakr/html5-slot-machine: https://github.com/johakr/html5-slot-machine
  - Strong UI/animation reference. MIT license. 611 stars, 282 forks as found on 2026-06-21.
  - Uses vanilla JS and Web Animations API. Good reference for reel motion, responsive slot UX, and low-bundle animation approach.

- aam263/Slot-Machine-Lines-Evaluator: https://github.com/aam263/Slot-Machine-Lines-Evaluator
  - Math reference. Given symbol counts and a paytable, returns RTP quickly.
  - Good conceptual reference for separating reel/symbol counts, paytable, and line evaluation.

- Akubet/RTPsim: https://github.com/Akubet/RTPsim
  - Math reference. Described as a PAR sheet calculator with exact RTP enumeration, hit frequency, variance, Monte Carlo bonus simulation, weighted reel strips, wild substitution, and 20 paylines.
  - Good target pattern for our own TypeScript simulator.

- orestislef/slot: https://github.com/orestislef/slot
  - Small example found via GitHub API. Description claims 5 reels, 10 paylines, bonus rounds, REST API, and about 95% RTP.
  - Worth reading for structure, not for visual polish.

### Hugging Face findings

- Hugging Face datasets search for `slot machine` and `casino slot` returned no useful datasets.
- Hugging Face models search found `Muapi/slot-machine-madness-flux`: https://huggingface.co/Muapi/slot-machine-madness-flux
  - Use only as possible visual/style inspiration for generated slot-machine imagery, not game logic.

## Recommended Game Logic Model

### Spin model

Use explicit reel strips instead of a single global weighted symbol bag.

Current style:

- Pick each visible tile independently from symbol weights.
- Easy to tune, but less like a real slot.

Recommended style:

- Define 5 reel strips, one array per reel.
- Each spin chooses one stop index per reel.
- The 3 visible rows come from stop-1, stop, stop+1 with wraparound.
- This gives us realistic reel identity, near-miss behavior, RTP simulation, and jackpot rarity control.

Suggested data shape:

```ts
type ReelStrip = string[];
type ReelSet = [ReelStrip, ReelStrip, ReelStrip, ReelStrip, ReelStrip];
```

### Win evaluation

Keep the existing 5x3 / 10-payline base, but make wins more explicit:

- Pay left-to-right only unless symbol says otherwise.
- Evaluate one symbol per payline position.
- Wild substitutes for standard symbols.
- Wild does not substitute for scatter or jackpot symbols.
- Scatter pays anywhere, not on paylines.
- Jackpot symbol can be natural-only to keep it rare.
- Pay the highest valid match per line.

### Jackpot options

Use three jackpot types for variety:

1. Fixed top award
   - Example: 5 natural highest-value symbols on an active payline pays 1000x bet.
   - Simple and easy to explain.

2. Local progressive jackpot
   - Starts at a seed value, for example 10,000 demo coins.
   - Each paid spin contributes a small percentage, for example 1% to 2% of bet.
   - Hit condition: 5 natural jackpot symbols on a designated payline or any active payline.
   - On hit, pay current meter and reset to seed.

3. Mystery jackpot
   - Hidden threshold chosen between min and max after reset.
   - Meter grows per spin.
   - Pays when the meter reaches threshold, independent of reel result.
   - For a demo game this creates excitement without making the payline math carry the whole jackpot burden.

Recommended for our next build: local progressive + fixed top award. Add mystery jackpot later.

### RTP and volatility targets

For fake-money entertainment, target a believable shape rather than regulated precision:

- RTP target: 94% to 96% demo RTP.
- Hit frequency: about 25% to 35% of spins produce any win.
- Volatility: medium-high. Frequent small wins, rare large wins, very rare jackpot.
- Max win: 1000x to 2500x bet for the first improved version.

Important: RTP is long-run expected value, not a promise for short play sessions.

### Simulator requirement

Before changing payouts or reel strips seriously, add a local simulation tool:

```text
npm run simulate:slots -- --spins 1000000
```

Output should include:

- Total bet
- Total paid
- RTP
- Hit frequency
- Free-spin trigger frequency
- Jackpot hit frequency
- Biggest win
- Average win
- Variance or volatility proxy
- Symbol/jackpot distribution

This lets us tune the game instead of guessing.

## Recommended Interface Direction

The current app is already themed, but it feels more like a game screen than a cabinet. A more accurate slot-machine face should include:

- Top jackpot/marquee meter with animated numbers.
- Cabinet frame with a visible top sign, reel bay, side lights, and bottom control deck.
- Meters that read like machine UI: CREDIT, BET, WIN, LINES, JACKPOT.
- Large round SPIN button on the lower right.
- Smaller icon buttons for menu, sound, info/paytable, turbo, and back.
- Payline indicators along the left/right edges of the reel window.
- Win roll-up animation where WIN counts upward after a payout.
- Reel stagger timing: reel 1 stops first, then 2, 3, 4, 5.
- Near-miss visual only if it is honest to the generated reel stop, never fake after the result.
- Paytable modal with symbol images and exact rules.
- Bonus/free-spin banner that changes the cabinet state when active.

## Interface Variants Worth Exploring

### Classic fruit cabinet

- Three or five reels.
- Fruit, bar, bell, seven styling.
- Chrome trim, red spin button, simple paytable on the face.
- Best for readability and nostalgia.

### Modern video slot

- Five reels, three rows.
- Full-screen theme art.
- Rich symbol tiles, animated payline highlights, paytable/help menu.
- Best match for the current project.

### Linked progressive cabinet

- Huge jackpot meter above the reels.
- Jackpot ladder: Mini, Minor, Major, Grand.
- Coin values or jackpot tokens on reels.
- Best for a more dramatic `7 Rings` theme.

### Hold-and-respin bonus slot

- Special jackpot symbols lock in place.
- Player gets 3 respins; each new jackpot symbol resets respins to 3.
- Very common modern bonus pattern and easy for players to understand.
- Strong candidate for `Aisle 7 Adventure` later.

## Recommended Next Implementation Plan

1. Add real reel strips and stop-index spin generation.
2. Add a TypeScript RTP simulator for 100k/1m spin runs.
3. Add jackpot meter state with seed, contribution rate, and reset behavior.
4. Add jackpot evaluation to the spin result.
5. Redesign the top/header into a cabinet-style jackpot marquee.
6. Add left/right payline markers and staggered reel-stop animation.
7. Upgrade paytable modal to show jackpot/free-spin/wild/scatter rules clearly.
8. Tune reel strips and payouts until simulation lands near the target demo RTP.

## Practical Rules for This Project

- Keep it fake-money only.
- Keep all game math local and transparent in source code.
- Do not imply casino certification, regulated randomness, or real-money readiness.
- Separate visuals from math: art can be flamboyant; payout logic should be boring, explicit, and testable.
