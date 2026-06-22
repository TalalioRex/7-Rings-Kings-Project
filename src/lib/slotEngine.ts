import type { JackpotWin, LineWin, Payline, ReelSet, ScatterWin, SlotGrid, SpinEvaluation, SymbolConfig, WinningPosition } from "@/types/slot";
import { JACKPOT_PAYLINE_ID, JACKPOT_SYMBOL_ID, REEL_COUNT, ROW_COUNT, SCATTER_SYMBOL_ID, WILD_SYMBOL_ID } from "@/lib/gameConfig";
import { PAYLINES } from "@/lib/paylines";
import { REEL_STRIPS, getVisibleSymbols } from "@/lib/reelStrips";
import { getRegularSymbols, getSymbol } from "@/lib/symbols";

export function getRandomWeightedSymbol(symbols: SymbolConfig[]): SymbolConfig {
  const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
  let cursor = Math.random() * totalWeight;

  for (const symbol of symbols) {
    cursor -= symbol.weight;
    if (cursor <= 0) {
      return symbol;
    }
  }

  return symbols[symbols.length - 1];
}

export function generateGrid(symbols: SymbolConfig[], reels = REEL_COUNT, rows = ROW_COUNT): SlotGrid {
  if (reels === REEL_COUNT && rows === ROW_COUNT) {
    return spinReelStrips().grid;
  }

  return Array.from({ length: reels }, () =>
    Array.from({ length: rows }, () => getRandomWeightedSymbol(symbols).id)
  );
}

export function spinReelStrips(
  reelSet: ReelSet = REEL_STRIPS,
  random: () => number = Math.random
): { grid: SlotGrid; stops: [number, number, number, number, number] } {
  const stops = reelSet.map((strip) => Math.floor(random() * strip.length)) as [number, number, number, number, number];
  const grid = reelSet.map((strip, reelIndex) => getVisibleSymbols(strip, stops[reelIndex]));

  return { grid, stops };
}

export function evaluateLine(
  lineSymbols: string[],
  payline: Payline,
  bet: number,
  wildSymbolId = WILD_SYMBOL_ID,
  scatterSymbolId = SCATTER_SYMBOL_ID,
  jackpotSymbolId = JACKPOT_SYMBOL_ID
): LineWin | null {
  const targetSymbolId = lineSymbols.find(
    (symbolId) => symbolId !== wildSymbolId && symbolId !== scatterSymbolId
  );
  const allWilds = lineSymbols.every((symbolId) => symbolId === wildSymbolId);

  if (!targetSymbolId && !allWilds) {
    return null;
  }

  const targetSymbol = allWilds
    ? getHighestPayingRegularSymbol()
    : getSymbol(targetSymbolId as string);

  if (targetSymbol.type !== "regular" && targetSymbol.type !== "jackpot") {
    return null;
  }

  let matchCount = 0;
  const positions: WinningPosition[] = [];

  for (let reel = 0; reel < lineSymbols.length; reel += 1) {
    const symbolId = lineSymbols[reel];
    const isJackpotLine = targetSymbol.id === jackpotSymbolId;
    const isMatch = isJackpotLine ? symbolId === targetSymbol.id : symbolId === targetSymbol.id || symbolId === wildSymbolId;

    if (!isMatch || symbolId === scatterSymbolId || (!isJackpotLine && symbolId === jackpotSymbolId)) {
      break;
    }

    matchCount += 1;
    positions.push({ reel, row: payline.positions[reel] });
  }

  if (matchCount < 3) {
    return null;
  }

  const multiplier = getMultiplier(targetSymbol, matchCount);
  if (!multiplier) {
    return null;
  }

  return {
    paylineId: payline.id,
    paylineName: payline.name,
    symbolId: targetSymbol.id,
    matchCount,
    multiplier,
    amount: bet * multiplier,
    positions
  };
}

export function applyWildsForLine(
  lineSymbols: string[],
  wildSymbolId = WILD_SYMBOL_ID,
  scatterSymbolId = SCATTER_SYMBOL_ID,
  jackpotSymbolId = JACKPOT_SYMBOL_ID
): { targetSymbolId: string | null; matchedSymbols: string[] } {
  const targetSymbolId =
    lineSymbols.find((symbolId) => symbolId !== wildSymbolId && symbolId !== scatterSymbolId) ?? null;

  if (!targetSymbolId) {
    return { targetSymbolId: null, matchedSymbols: lineSymbols };
  }

  return {
    targetSymbolId,
    matchedSymbols: lineSymbols.map((symbolId) => (symbolId === wildSymbolId && targetSymbolId !== jackpotSymbolId ? targetSymbolId : symbolId))
  };
}

export function evaluatePaylines(grid: SlotGrid, paylines: Payline[], bet: number): LineWin[] {
  return paylines.flatMap((payline) => {
    const lineSymbols = payline.positions.map((row, reel) => grid[reel][row]);
    const lineWin = evaluateLine(lineSymbols, payline, bet);
    return lineWin ? [lineWin] : [];
  });
}

export function countScatters(grid: SlotGrid, scatterSymbolId = SCATTER_SYMBOL_ID): number {
  return grid.flat().filter((symbolId) => symbolId === scatterSymbolId).length;
}

export function getScatterWin(grid: SlotGrid, bet: number, scatterSymbolId = SCATTER_SYMBOL_ID): ScatterWin | null {
  const positions: WinningPosition[] = [];

  grid.forEach((reel, reelIndex) => {
    reel.forEach((symbolId, rowIndex) => {
      if (symbolId === scatterSymbolId) {
        positions.push({ reel: reelIndex, row: rowIndex });
      }
    });
  });

  const multiplier = getScatterMultiplier(positions.length);
  if (!multiplier) {
    return null;
  }

  return {
    symbolId: scatterSymbolId,
    count: positions.length,
    multiplier,
    amount: bet * multiplier,
    positions
  };
}

export function getJackpotWin(
  grid: SlotGrid,
  jackpotMeter: number,
  paylineId = JACKPOT_PAYLINE_ID,
  jackpotSymbolId = JACKPOT_SYMBOL_ID
): JackpotWin | null {
  const candidatePaylines = paylineId === "any" ? PAYLINES : PAYLINES.filter((line) => line.id === paylineId);
  const payline = candidatePaylines.find((line) => line.positions.every((row, reel) => grid[reel][row] === jackpotSymbolId));
  if (!payline) {
    return null;
  }

  return {
    symbolId: jackpotSymbolId,
    amount: jackpotMeter,
    paylineId: payline.id,
    paylineName: payline.name,
    positions: payline.positions.map((row, reel) => ({ reel, row }))
  };
}

export function calculateTotalWin(lineWins: LineWin[]): number {
  return lineWins.reduce((total, win) => total + win.amount, 0);
}

export function calculateSpinTotalWin(lineWins: LineWin[], scatterWin: ScatterWin | null, jackpotWin: JackpotWin | null): number {
  return calculateTotalWin(lineWins) + (scatterWin?.amount ?? 0) + (jackpotWin?.amount ?? 0);
}

export function getFreeSpinAward(scatterCount: number): number {
  if (scatterCount >= 5) return 20;
  if (scatterCount === 4) return 12;
  if (scatterCount === 3) return 8;
  return 0;
}

export function evaluateSpin(
  grid: SlotGrid,
  paylines: Payline[],
  bet: number,
  allowFreeSpinRetrigger = false,
  jackpotMeter = 0
): SpinEvaluation {
  const lineWins = evaluatePaylines(grid, paylines, bet);
  const scatterCount = countScatters(grid);
  const scatterWin = getScatterWin(grid, bet);
  const jackpotWin = getJackpotWin(grid, jackpotMeter);
  const freeSpinsAwarded = allowFreeSpinRetrigger ? getFreeSpinAward(scatterCount) : 0;
  const winningPositions = dedupePositions([
    ...lineWins.flatMap((win) => win.positions),
    ...(scatterWin?.positions ?? []),
    ...(jackpotWin?.positions ?? [])
  ]);

  return {
    lineWins,
    scatterWin,
    jackpotWin,
    scatterCount,
    freeSpinsAwarded,
    totalWin: calculateSpinTotalWin(lineWins, scatterWin, jackpotWin),
    winningPositions
  };
}

function getMultiplier(symbol: SymbolConfig, matchCount: number): number {
  if (matchCount >= 5) return symbol.payouts?.five ?? 0;
  if (matchCount === 4) return symbol.payouts?.four ?? 0;
  if (matchCount === 3) return symbol.payouts?.three ?? 0;
  return 0;
}

function getScatterMultiplier(scatterCount: number): number {
  if (scatterCount >= 5) return 23;
  if (scatterCount === 4) return 7;
  if (scatterCount === 3) return 2;
  return 0;
}

function getHighestPayingRegularSymbol(): SymbolConfig {
  return [...getRegularSymbols()].sort((a, b) => (b.payouts?.five ?? 0) - (a.payouts?.five ?? 0))[0];
}

function dedupePositions(positions: WinningPosition[]): WinningPosition[] {
  const seen = new Set<string>();
  return positions.filter((position) => {
    const key = `${position.reel}:${position.row}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
