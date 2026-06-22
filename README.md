# 7 Rings: Aisle 7 Jackpot

Phase 1 is locked to **Cursed Reels**, a fake-money slot prototype for the **7 Rings, 7 Kings Universe**. `Aisle 7 Adventure` is visible in mode select but remains locked.

This is a creative demo only. It does not include real money, deposits, withdrawals, payments, wallets, certified RTP, casino compliance, regulated randomness, or production gambling infrastructure.

## Phase 1 Status

- Cursed Reels is playable
- Aisle 7 Adventure is locked
- Movie clips are intentionally excluded
- Story gameplay is intentionally excluded
- No backend gambling systems are included

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

Optional math simulator:

```bash
npm run simulate:slots
npm run simulate:slots -- --spins 1000000
```

## What Cursed Reels Includes

- Mode select with a locked Adventure card
- Cinematic launcher-style mode select using scanned project assets
- 5 reels x 3 rows
- 10 paylines
- Explicit reel strips with staggered stop animation
- Fake demo coin balance
- Local progressive demo jackpot meter
- Bet controls: 10, 20, 50, 100, 200
- Shrimpie the Seventh Jackpot symbol
- Chuck Vadar Wild behavior
- Aisle 7 Scatter behavior with anywhere scatter pays
- Free spins: 3 = 8, 4 = 12, 5+ = 20
- Paytable modal
- Settings modal
- Fast spin toggle
- Sound/music placeholders
- Reset demo balance
- LocalStorage persistence for balance and settings

## Aisle 7 Adventure Status

`Aisle 7 Adventure` remains a locked / Coming Soon preview only. Phase 1.7 may use scanned intro, background, or chapter imagery as a non-playable teaser, but it does not add story gameplay, clip gameplay, chapter progression, mini-games, or adventure systems.

## Intentionally Excluded

- Movie clips
- Story gameplay
- Mini-games
- Ring progression
- Hidden seventh king reveal
- Login
- Backend game services
- Database
- Leaderboards
- Real-money systems
- Casino certification or compliance claims

## Assets

Phase 1.7 rescanned the full project folder as the master content repository, excluding generated/dependency folders such as `.next` and `node_modules`.

```text
Backgrounds/
Chapter 1/
Chapter 2/
Chapter 3/
Chapter 4/
Chapter 5/
Chapter 6/
Chapter 7/
Chapter 8/
Intro/
Logo/
Roadmap/
Slot Assets/
public/
src/
```

Source assets remain untouched. Browser-ready copies live under:

```text
public/assets/logo/
public/assets/intro/images/
public/assets/intro/videos/
public/assets/backgrounds/
public/assets/chapters/
public/assets/scenes/
public/assets/characters/
public/assets/slot-symbols/
public/assets/jackpot/
```

Central asset metadata lives in:

```text
src/lib/assets.ts
```

Phase 1.7 selected defaults:

- Official launcher logo: `Logo/Logo with the Background.png`
- Mode-select ambience: `Intro/Images/Intro-1.png` and muted looping `Intro/Video/Intro-Logo.mp4`
- Gameplay background: `Backgrounds/Background (1).png`
- Locked Adventure teaser: `Chapter 1/Imagery/Scene 1A.png`
- Default feature-panel character: `Slot Assets/Main Characters/Tala.png`
- Jackpot symbol: `Slot Assets/Shrimpie the Seventh/Shrimpie the Seventh.png`

## Symbol Setup

Edit `src/lib/symbols.ts` to add or replace symbols. Each symbol should define:

- `id`
- `displayName`
- `type`
- `assetPath`
- `sourceFolderName`
- `fallbackColor`
- `glowColor`
- `payouts`
- `weight`
- `description`

Edit `src/lib/paylines.ts` to change paylines.

Edit `src/lib/gameConfig.ts` to change bet options, starting balance, Wild ID, Scatter ID, jackpot settings, and storage keys.

Edit `src/lib/reelStrips.ts` to change reel strip ordering.

Edit `src/lib/slotEngine.ts` for spin evaluation rules.

## Demo Rules

- Jackpot symbol: `Shrimpie the Seventh`
- Wild symbol: `Chuck Vadar`
- Scatter symbol: `Aisle 7 Scatter` placeholder if no dedicated source image exists
- Free spins: 3 scatters = 8, 4 scatters = 12, 5+ scatters = 20
- Paylines: 10 active paylines
- Shrimpie pays high line values for 3, 4, or 5 matches
- Five natural Shrimpie symbols on any active payline trigger the local demo jackpot meter
- Wilds substitute for regular symbols only
- Wilds do not substitute for Scatter or Shrimpie Jackpot
- Scatters count anywhere on the 5x3 grid
- Free spins do not cost demo coins
- Free spins do not change bet during the free-spin sequence

## Reset Demo Balance

Use the Settings modal in the game and choose Reset Demo Balance.

## Fake-Money Notice

This is a fake-money creative prototype.

No real-money gambling.
No deposits.
No withdrawals.
No wallet.
No payments.
No certified RTP.
No casino compliance claim.
No production gambling infrastructure.

## Known Limitations

- Adventure mode is a locked preview only
- Character panel is a future-feature teaser only
- Assets fall back to polished placeholders if an image is missing
- Some scanned chapter/video assets are intentionally not copied into `public` because they are future story assets or too heavy for Phase 1 UI
- The demo does not simulate production gambling math or compliance
