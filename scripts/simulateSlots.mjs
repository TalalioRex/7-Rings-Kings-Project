const BET = 50;
const JACKPOT_SEED = 10000;
const JACKPOT_CONTRIBUTION_RATE = 0.01;
const JACKPOT_SYMBOL_ID = "shrimpie-the-seventh";
const WILD_SYMBOL_ID = "chuck-vadar";
const SCATTER_SYMBOL_ID = "aisle-7-scatter";

const PAYLINES = [
  { id: "top", name: "Top Row", positions: [0, 0, 0, 0, 0] },
  { id: "middle", name: "Middle Row", positions: [1, 1, 1, 1, 1] },
  { id: "bottom", name: "Bottom Row", positions: [2, 2, 2, 2, 2] },
  { id: "v", name: "V Shape", positions: [0, 1, 2, 1, 0] },
  { id: "inverted-v", name: "Inverted V", positions: [2, 1, 0, 1, 2] },
  { id: "zigzag-1", name: "Zigzag 1", positions: [0, 1, 0, 1, 0] },
  { id: "zigzag-2", name: "Zigzag 2", positions: [2, 1, 2, 1, 2] },
  { id: "diagonal-down", name: "Diagonal Down", positions: [0, 0, 1, 2, 2] },
  { id: "diagonal-up", name: "Diagonal Up", positions: [2, 2, 1, 0, 0] },
  { id: "mixed-center", name: "Mixed Center", positions: [1, 0, 1, 2, 1] }
];

const SYMBOLS = {
  "shrimpie-the-seventh": { type: "jackpot", payouts: { three: 50, four: 250, five: 1000 } },
  "lord-swizzlepop": { type: "regular", payouts: { three: 4, four: 12, five: 45 } },
  "sourcerer-sash": { type: "regular", payouts: { three: 4, four: 12, five: 45 } },
  "grand-lolliwick": { type: "regular", payouts: { three: 3, four: 8, five: 28 } },
  "marshal-mallow": { type: "regular", payouts: { three: 3, four: 8, five: 28 } },
  "master-nigiri": { type: "regular", payouts: { three: 3, four: 8, five: 28 } },
  "blinky-bluewig": { type: "regular", payouts: { three: 1, four: 4, five: 15 } },
  "ziggy-zestwig": { type: "regular", payouts: { three: 1, four: 4, five: 15 } },
  "chuck-vadar": { type: "wild" },
  "aisle-7-scatter": { type: "scatter" }
};

const REEL_STRIPS = [
  [
    "blinky-bluewig", "lord-swizzlepop", "aisle-7-scatter", "ziggy-zestwig", "master-nigiri", "shrimpie-the-seventh",
    "grand-lolliwick", "marshal-mallow", "sourcerer-sash", "blinky-bluewig", "chuck-vadar", "ziggy-zestwig",
    "lord-swizzlepop", "master-nigiri", "blinky-bluewig", "grand-lolliwick", "marshal-mallow", "master-nigiri",
    "sourcerer-sash", "blinky-bluewig", "ziggy-zestwig", "lord-swizzlepop"
  ],
  [
    "ziggy-zestwig", "master-nigiri", "lord-swizzlepop", "ziggy-zestwig", "sourcerer-sash", "shrimpie-the-seventh",
    "blinky-bluewig", "grand-lolliwick", "marshal-mallow", "chuck-vadar", "ziggy-zestwig", "master-nigiri",
    "lord-swizzlepop", "aisle-7-scatter", "blinky-bluewig", "lord-swizzlepop", "grand-lolliwick", "sourcerer-sash",
    "marshal-mallow", "ziggy-zestwig", "blinky-bluewig", "master-nigiri"
  ],
  [
    "master-nigiri", "blinky-bluewig", "grand-lolliwick", "shrimpie-the-seventh", "marshal-mallow", "ziggy-zestwig",
    "master-nigiri", "lord-swizzlepop", "sourcerer-sash", "chuck-vadar", "blinky-bluewig", "grand-lolliwick",
    "master-nigiri", "sourcerer-sash", "marshal-mallow", "ziggy-zestwig", "grand-lolliwick", "lord-swizzlepop",
    "sourcerer-sash", "blinky-bluewig", "grand-lolliwick", "master-nigiri"
  ],
  [
    "grand-lolliwick", "sourcerer-sash", "blinky-bluewig", "shrimpie-the-seventh", "lord-swizzlepop", "marshal-mallow",
    "ziggy-zestwig", "aisle-7-scatter", "master-nigiri", "chuck-vadar", "grand-lolliwick", "sourcerer-sash",
    "blinky-bluewig", "grand-lolliwick", "lord-swizzlepop", "marshal-mallow", "ziggy-zestwig", "aisle-7-scatter",
    "master-nigiri", "grand-lolliwick", "sourcerer-sash", "blinky-bluewig"
  ],
  [
    "marshal-mallow", "ziggy-zestwig", "sourcerer-sash", "shrimpie-the-seventh", "blinky-bluewig", "grand-lolliwick",
    "lord-swizzlepop", "master-nigiri", "blinky-bluewig", "chuck-vadar", "marshal-mallow", "ziggy-zestwig",
    "sourcerer-sash", "master-nigiri", "blinky-bluewig", "grand-lolliwick", "lord-swizzlepop", "master-nigiri",
    "aisle-7-scatter", "marshal-mallow", "ziggy-zestwig", "sourcerer-sash"
  ]
];

const requestedSpins = readSpinCount();
let paidSpins = 0;
let totalResolvedSpins = 0;
let totalBet = 0;
let totalPaid = 0;
let paidWins = 0;
let freeSpinTriggers = 0;
let freeSpinsQueued = 0;
let jackpotHits = 0;
let jackpotMeter = JACKPOT_SEED;
let biggestWin = 0;
let sumSquaredPayoutRatio = 0;

while (paidSpins < requestedSpins || freeSpinsQueued > 0) {
  const isFreeSpin = freeSpinsQueued > 0;
  if (isFreeSpin) {
    freeSpinsQueued -= 1;
  } else {
    paidSpins += 1;
    totalBet += BET;
    jackpotMeter += Math.max(1, Math.round(BET * JACKPOT_CONTRIBUTION_RATE));
  }

  totalResolvedSpins += 1;
  const grid = spinGrid();
  const result = evaluateSpin(grid, jackpotMeter);

  if (result.freeSpinsAwarded > 0 && !isFreeSpin) {
    freeSpinTriggers += 1;
    freeSpinsQueued += result.freeSpinsAwarded;
  }

  if (result.jackpotWin > 0) {
    jackpotHits += 1;
    jackpotMeter = JACKPOT_SEED;
  }

  if (result.totalWin > 0) {
    paidWins += 1;
  }

  totalPaid += result.totalWin;
  biggestWin = Math.max(biggestWin, result.totalWin);
  sumSquaredPayoutRatio += Math.pow(result.totalWin / BET, 2);
}

const rtp = percentage(totalPaid / totalBet);
const hitFrequency = percentage(paidWins / totalResolvedSpins);
const freeSpinFrequency = percentage(freeSpinTriggers / paidSpins);
const jackpotFrequency = percentage(jackpotHits / paidSpins);
const averagePaidWin = paidWins ? totalPaid / paidWins : 0;
const volatilityProxy = sumSquaredPayoutRatio / totalResolvedSpins;

console.log(`Slot simulation: 7 Rings Cursed Reels`);
console.log(`Requested paid spins: ${requestedSpins.toLocaleString()}`);
console.log(`Total resolved spins: ${totalResolvedSpins.toLocaleString()}`);
console.log(`Total bet: ${Math.round(totalBet).toLocaleString()}`);
console.log(`Total paid: ${Math.round(totalPaid).toLocaleString()}`);
console.log(`RTP: ${rtp}`);
console.log(`Hit frequency: ${hitFrequency}`);
console.log(`Free-spin trigger frequency: ${freeSpinFrequency}`);
console.log(`Jackpot hits: ${jackpotHits.toLocaleString()} (${jackpotFrequency})`);
console.log(`Biggest win: ${Math.round(biggestWin).toLocaleString()}`);
console.log(`Average paid win: ${averagePaidWin.toFixed(2)}`);
console.log(`Volatility proxy E[(win/bet)^2]: ${volatilityProxy.toFixed(4)}`);
console.log(`Ending jackpot meter: ${Math.round(jackpotMeter).toLocaleString()}`);

function spinGrid() {
  return REEL_STRIPS.map((strip) => {
    const stop = Math.floor(Math.random() * strip.length);
    return [strip[wrap(stop - 1, strip.length)], strip[stop], strip[wrap(stop + 1, strip.length)]];
  });
}

function evaluateSpin(grid, jackpotValue) {
  const lineWin = PAYLINES.reduce((sum, payline) => sum + evaluateLine(grid, payline), 0);
  const scatterCount = grid.flat().filter((symbolId) => symbolId === SCATTER_SYMBOL_ID).length;
  const scatterWin = scatterMultiplier(scatterCount) * BET;
  const jackpotWin = isJackpot(grid) ? jackpotValue : 0;

  return {
    totalWin: lineWin + scatterWin + jackpotWin,
    freeSpinsAwarded: freeSpinAward(scatterCount),
    jackpotWin
  };
}

function evaluateLine(grid, payline) {
  const lineSymbols = payline.positions.map((row, reel) => grid[reel][row]);
  const targetSymbolId = lineSymbols.find((symbolId) => symbolId !== WILD_SYMBOL_ID && symbolId !== SCATTER_SYMBOL_ID);
  const allWilds = lineSymbols.every((symbolId) => symbolId === WILD_SYMBOL_ID);

  if (!targetSymbolId && !allWilds) return 0;

  const target = allWilds ? "lord-swizzlepop" : targetSymbolId;
  if (SYMBOLS[target]?.type !== "regular" && SYMBOLS[target]?.type !== "jackpot") return 0;

  let count = 0;
  for (const symbolId of lineSymbols) {
    const isJackpotLine = target === JACKPOT_SYMBOL_ID;
    if (isJackpotLine ? symbolId !== target : symbolId !== target && symbolId !== WILD_SYMBOL_ID) break;
    if (symbolId === SCATTER_SYMBOL_ID || (!isJackpotLine && symbolId === JACKPOT_SYMBOL_ID)) break;
    count += 1;
  }

  if (count < 3) return 0;
  const payouts = SYMBOLS[target].payouts;
  const multiplier = count >= 5 ? payouts.five : count === 4 ? payouts.four : payouts.three;
  return multiplier * BET;
}

function isJackpot(grid) {
  return PAYLINES.some((payline) => payline.positions.every((row, reel) => grid[reel][row] === JACKPOT_SYMBOL_ID));
}

function freeSpinAward(scatterCount) {
  if (scatterCount >= 5) return 20;
  if (scatterCount === 4) return 12;
  if (scatterCount === 3) return 8;
  return 0;
}

function scatterMultiplier(scatterCount) {
  if (scatterCount >= 5) return 23;
  if (scatterCount === 4) return 7;
  if (scatterCount === 3) return 2;
  return 0;
}

function wrap(index, length) {
  return ((index % length) + length) % length;
}

function percentage(value) {
  return `${(value * 100).toFixed(3)}%`;
}

function readSpinCount() {
  const spinsArgIndex = process.argv.findIndex((arg) => arg === "--spins");
  const positional = process.argv.find((arg) => /^\d+$/.test(arg));
  const raw = spinsArgIndex >= 0 ? process.argv[spinsArgIndex + 1] : positional;
  const parsed = raw ? Number(raw) : 100000;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 100000;
}
