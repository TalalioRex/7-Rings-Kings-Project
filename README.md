# 7 Rings 7 Kings

Phase 1 is locked to **7 Rings 7 Kings: A Very Suspicious 7-Eleven**, a fake-money slot prototype for the **7 Rings 7 Kings Universe**. `Aisle 7 Adventure` is visible in mode select but remains locked.

This is a creative demo only. It does not include real money, deposits, withdrawals, payments, wallets, certified RTP, casino compliance, regulated randomness, or production gambling infrastructure.

## Phase 1 Status

- A Very Suspicious 7-Eleven is playable
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

## What A Very Suspicious 7-Eleven Includes

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
- Sound effects support through Howler with safe failure when audio files are missing
- Reset demo balance
- LocalStorage persistence for balance and settings

## Aisle 7 Adventure Status

`Aisle 7 Adventure` remains a locked / Coming Soon preview. The mode-select card includes a clearly labeled Prototype Test button for the first Phase 2A mini-game only; this does not unlock full Adventure mode, story gameplay, clip playback, chapter progression, or a full mini-game suite.

## Phase 2A Mini-Game Prototype

`Marcus Smash Round: Vegan Aisle Incident` is the first contained Phase 2A mini-game prototype connected to the movie universe.

How to test it:

1. Open mode select.
2. Find the locked `Aisle 7 Adventure` card.
3. Choose `Prototype Mini-Game / Test Marcus Smash Round`.

Gameplay:

- React-powered arcade whack-style game mounted inside the React/Next.js shell
- 30-second timed round
- 3x3 cursed vegan shelf grid
- Cursed vegan enemies pop out of shelf compartments
- Click or tap enemies to smash them
- Friendly/helpful pop-ups can appear and should not be hit
- Missed enemies counterattack Marcus and remove health
- Marcus starts with 3 hearts
- Last 5 seconds triggers `MARCUS FRENZY`
- Quick hits build combo tiers: x2 at 3 combo, x3 at 6 combo, x5 at 10 combo
- Power-ups can appear: Red Velocity Slam, Marcus Rage, Kaz Freeze, Pippa Scan, Tala Chaos Spark
- Score converts into fake-money slot rewards at the end

Reward bridge:

- Mini-game rewards return to the slot through `applyMiniGameReward`
- Rewards can add fake demo coins
- Rewards can add free spins
- The top tier stores a `2x` next paid spin multiplier
- 10+ combo adds +1 free spin
- Full health adds +250 demo coins
- These are prototype effects only, not real-money rewards

Assets used:

- Marcus hero art: `Slot Assets/Main Characters/Marcus.png`, copied to `/assets/characters/marcus.png`
- No vegan aisle, tofu, oat milk, plant burger, chickpea, cheese, kale, tempeh, Kenney UI, or Kenney audio assets were found locally in the asset scan
- CSS/React draws polished placeholder targets for: Cursed Tofu Block, Angry Oat Milk, Haunted Almond Milk, Plant Burger Goblin, Vegan Protein Bar, Evil Chickpea Can, Fake Cheese Slice, Possessed Kale, Tempeh Gremlin
- Friendly placeholders: Pippa Scanner Beacon, Kaz Cold Marker, Safe Snack, Bonus Ring Spark

Expected future audio file names:

```text
public/assets/third-party/kenney/audio/casino/mini-start.mp3
public/assets/third-party/kenney/audio/impact/target-pop.mp3
public/assets/third-party/kenney/audio/impact/smash-hit.mp3
public/assets/third-party/kenney/audio/impact/miss-hit.mp3
public/assets/third-party/kenney/audio/impact/marcus-hit.mp3
public/assets/third-party/kenney/audio/interface/powerup.mp3
public/assets/third-party/kenney/audio/interface/combo.mp3
public/assets/third-party/kenney/audio/casino/frenzy.mp3
public/assets/third-party/kenney/audio/interface/round-complete.mp3
public/assets/third-party/kenney/audio/interface/reward-claim.mp3
```

Known mini-game limitations:

- The arcade board uses React/CSS for stability, while visual sprites are still procedural placeholders
- Kenney UI/audio packs are not present locally yet
- No movie clip integration
- No full Adventure progression
- No real food packaging or brand logos
- Audio uses the existing audio manager and browser-generated fallback sounds until dedicated audio files are added

## Phase 2B Mini-Game Prototype

`Tala Wild Spark Chase: Candy Aisle Chaos` is the second contained prototype mini-game. It is a fast collect-and-dodge lane chase and does not unlock full `Aisle 7 Adventure`.

How to test it:

1. Open mode select.
2. Find the locked `Aisle 7 Adventure` card.
3. Choose `Prototype Mini-Game / Play Tala Wild Spark Chase`.

Controls:

- Desktop: `Arrow Left`, `Arrow Right`, `A`, and `D`
- Mobile/touch: tap the target lane

Gameplay:

- 30-second timed round
- Tala starts with 3 hearts
- Tala stays near the bottom of a 3-lane cursed candy aisle
- Good objects travel toward Tala: Wild Spark, Ring Spark, Bonus Coin
- Bad objects must be dodged: Poisonous Sweet, Cursed Gummy Worm, Sour Strip Trap, Lollipop Watcher, Marshmallow Bouncer
- Power-ups can appear: Wild Spark Mode, Pippa Warning Signal, Heartstorm Bubble, Velocity Dash
- Combo tiers: x2 at 3 combo, x3 at 6 combo, x5 at 10 combo
- Last 7 seconds triggers `WILD SPARK FRENZY`
- Health reaching 0 ends the round early
- The prototype avoids final-reveal content

Scoring and rewards:

- Wild Spark: +50
- Ring Spark: +150
- Bonus Coin: +100
- Power-up pickup: +100
- Dodged bad candy: +10
- Bad candy hit: loses 1 heart and can reduce score
- 10+ combo adds +1 free spin
- Full health adds +250 demo coins
- 3500+ points awards 2000 demo coins, 5 free spins, and +1 Tala demo jackpot boost

Reward bridge:

- Tala rewards return to the slot through the same `applyMiniGameReward` bridge as Marcus Smash
- Rewards can add fake demo coins
- Rewards can add free spins
- The top tier can add one step to Tala's existing prototype jackpot boost counter
- These are fake-money prototype effects only

Assets used:

- Tala hero/player art: `Slot Assets/Main Characters/Tala.png`, copied to `/assets/characters/tala.png`
- No dedicated candy aisle, candy shelf, Wild Spark, gummy, sour strip, or cursed candy object assets were found in the app-ready asset set
- The first prototype uses polished neon placeholder lane objects and no real candy brand packaging

Expected optional audio file names:

```text
public/assets/audio/tala-mini-start.mp3
public/assets/audio/lane-move.mp3
public/assets/audio/spark-pickup.mp3
public/assets/audio/bad-candy-hit.mp3
public/assets/audio/powerup-pickup.mp3
public/assets/audio/shield-activate.mp3
public/assets/audio/wild-frenzy.mp3
public/assets/audio/combo-up.mp3
public/assets/audio/round-complete.mp3
public/assets/audio/reward-claim.mp3
```

Known Tala mini-game limitations:

- React/CSS is used for this first playable pass instead of Phaser to avoid the blank-canvas/runtime issue seen during earlier mini-game testing
- Candy objects are placeholder UI sprites
- No movie clip integration
- No full Adventure progression
- No leaderboard, backend, login, payments, wallet, or real-money systems

## Phase 2C Mini-Game Prototype

`Pippa Signal Scanner: Prank Aisle Lockdown` is the third contained prototype mini-game. It is a scanner/search precision game built around Pippa's Ring of Signal and the cursed prank aisle.

How to test it:

1. Open mode select.
2. Find the locked `Aisle 7 Adventure` card.
3. Choose `Prototype Mini-Game / Play Pippa Signal Scanner`.

Controls and scanner mechanic:

- Desktop: hover shelf compartments to scan, then click the correct signal source
- Mobile/touch: tap a compartment to scan and select it
- The board is a 4x3 prank aisle shelf
- Scanner pulse briefly reveals each compartment's signal
- Cursed targets should be neutralized
- Decoys, safe items, and signal traps should be avoided
- Chuck Vadar can appear as a rare two-tap special signal target

Interference system:

- Pippa starts at 0% interference
- Wrong taps, decoys, and signal traps increase interference
- Correct neutralizations and stabilizer power-ups can reduce interference
- At 100% interference, the round ends early
- Last 7 seconds triggers `SIGNAL SURGE`, increasing points and mistake danger

Targets:

- Cursed targets: Cursed Rubber Chicken, Prank Gum Trap, Joy Buzzer Demon, Fake Mustache Swarm, Fart Spray Phantom, Fake Ear Whisperer
- Decoys: Harmless Rubber Chicken, Normal Prank Gum, Ordinary Fake Mustache
- Signal traps: Static Burst, Glitch Shelf, Laugh Track Curse
- Special target: Chuck Vadar Signal
- Power-ups: Jason Vision Ping, Kaz Silence Field, Pascale Heartstorm Filter, Tala Spark Glitch, Signal Stabilizer

Scoring and rewards:

- Cursed target neutralized: +100 or more
- Chuck Vadar signal: +300
- Power-up collected: +100
- Wrong safe/decoy tap: score penalty and interference
- Signal trap hit: larger score penalty and interference
- Combo tiers: x2 at 3 combo, x3 at 6 combo, x5 at 10 combo
- Below 25% final interference adds +250 demo coins
- Detecting Chuck Vadar adds +1 free spin
- 10+ combo adds +1 free spin
- 3500+ points awards 2000 demo coins, 5 free spins, and a 2x next paid spin multiplier

Reward bridge:

- Pippa rewards return to the slot through the shared `applyMiniGameReward` bridge
- Rewards can add fake demo coins
- Rewards can add free spins
- Top-tier reward can store a `2x` next paid spin multiplier
- These are fake-money prototype effects only

Assets used:

- Pippa hero art: `Slot Assets/Main Characters/Pippa.png`, copied to `/assets/characters/pippa.png`
- Chuck Vadar special signal art: `/assets/slot-symbols/chuck-vadar/symbol.png`
- No dedicated prank aisle, rubber chicken, prank gum, joy buzzer, fake ear, or fart spray art was found in the app-ready asset set
- The first prototype uses polished neon scanner placeholders and no real prank/candy brand packaging

Expected optional audio file names:

```text
public/assets/audio/pippa-mini-start.mp3
public/assets/audio/scanner-pulse.mp3
public/assets/audio/signal-correct.mp3
public/assets/audio/signal-wrong.mp3
public/assets/audio/interference-warning.mp3
public/assets/audio/powerup-pickup.mp3
public/assets/audio/chuck-detected.mp3
public/assets/audio/signal-surge.mp3
public/assets/audio/combo-up.mp3
public/assets/audio/round-complete.mp3
public/assets/audio/reward-claim.mp3
```

Known Pippa mini-game limitations:

- React/CSS is used for this first playable pass instead of Phaser for stability
- Prank aisle objects are placeholder scanner tiles
- No movie clip integration
- No full Adventure progression
- No leaderboard, backend, login, payments, wallet, or real-money systems

## Phase 2D Mini-Game Prototype

`Kaz Silent Strength: Cold Mist Path` is the fourth contained prototype mini-game. It is a stealth/timing path game built around Kaz moving through a cold sushi-area mist without disturbing cursed shelf spirits.

How to test it:

1. Open mode select.
2. Find the locked `Aisle 7 Adventure` card.
3. Choose `Prototype Mini-Game / Play Kaz Cold Mist Path`.

Controls:

- Desktop movement: `Arrow keys` or `WASD`
- Desktop slash: `Space`
- Desktop shield step: `Shift`
- Mobile/touch: tap a nearby target direction on the grid; use the visible `Silent Slash` and `Silence Step` buttons

Stealth mechanic:

- Kaz starts with 3 hearts and 100 stealth
- Moving tile by tile builds score and combo
- Mist waves sweep columns of the grid
- Standing in an active mist wave costs 1 heart, score, and stealth
- Cursed and false-safe tiles damage Kaz
- Checkpoints restore stealth and award points
- Stealth above 75 at the end grants +1 free spin
- If stealth reaches 0, the score multiplier drops

Board elements:

- Safe tiles briefly glow cyan
- Cursed tiles and false-safe tiles punish careless movement
- Blocked shelf-shadow tiles cannot be crossed
- Exit tile ends the round successfully
- Spirits can be removed with `Silent Slash`
- Cold Surge triggers in the last 7 seconds

Collectibles and power-ups:

- Silent Strength Orb: +50
- Ring Echo: +150
- Mist Pearl: +100 and restores stealth
- Shield Seal: protects from one mist hit
- Silence Field: slows mist waves for 4 seconds
- Cyan Slash: next slash clears spirits in a wider radius
- Jason Vision Ping: reveals safe path glow
- Pippa Signal Lock: marks cursed/false-safe/spirit tiles
- Heartstorm Guard: adds one shield hit

Scoring and rewards:

- Correct movement/action can continue combo within 2 seconds
- Combo tiers: x2 at 3 combo, x3 at 6 combo, x5 at 10 combo
- Correct Silent Slash: +150
- Reach checkpoint: +200
- Reach exit: +500
- Hit by mist: -100
- Wrong slash: -50
- Reaching the exit adds +500 demo coins
- Finishing with all 3 hearts adds +250 demo coins
- 3500+ points awards 2000 demo coins, 5 free spins, and a 2x next paid spin multiplier

Reward bridge:

- Kaz rewards return to the slot through the shared `applyMiniGameReward` bridge
- Rewards can add fake demo coins
- Rewards can add free spins
- Top-tier reward can store a `2x` next paid spin multiplier
- These are fake-money prototype effects only

Assets used:

- Kaz hero/player art: `Slot Assets/Main Characters/Kaz.png`, copied to `/assets/characters/kaz.png`
- Sushi-area source reference found: `Slot Assets/Master Nigiri/`, with app-ready `/assets/slot-symbols/master-nigiri/symbol.png`
- No dedicated cold mist, sushi case, freezer, or aisle hazard assets were found in the app-ready asset set
- The first prototype uses polished cyan mist/grid placeholders and no real brand packaging

Expected optional audio file names:

```text
public/assets/audio/kaz-mini-start.mp3
public/assets/audio/kaz-step.mp3
public/assets/audio/mist-wave.mp3
public/assets/audio/orb-pickup.mp3
public/assets/audio/silent-slash.mp3
public/assets/audio/wrong-slash.mp3
public/assets/audio/kaz-hit.mp3
public/assets/audio/powerup-pickup.mp3
public/assets/audio/cold-surge.mp3
public/assets/audio/combo-up.mp3
public/assets/audio/round-complete.mp3
public/assets/audio/reward-claim.mp3
```

Known Kaz mini-game limitations:

- React/CSS is used for this first playable pass instead of Phaser for stability
- Mist, spirits, sushi-area hazards, and tile effects are placeholder UI elements
- No movie clip integration
- No full Adventure progression
- No leaderboard, backend, login, payments, wallet, or real-money systems

## Intentionally Excluded

- Movie clips
- Story gameplay
- Full mini-game suite
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
public/assets/audio/
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
- Jackpot celebration art: all seven images from `Slot Assets/Shrimpie the Seventh/`

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
- Prototype Demo Feature: when Tala is selected, paid spin 1 shows 1/3, paid spin 2 shows 2/3, and paid spin 3 forces a real Shrimpie jackpot grid. Free spins do not count, and changing characters resets the counter.

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
- Non-Tala character mechanics are future-feature previews only
- No audio files are currently present in `public/assets/audio/`; Howler attempts are ignored safely when files are missing
- Assets fall back to polished placeholders if an image is missing
- Some scanned chapter/video assets are intentionally not copied into `public` because they are future story assets or too heavy for Phase 1 UI
- The demo does not simulate production gambling math or compliance
