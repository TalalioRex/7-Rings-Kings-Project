export type SymbolType = "regular" | "wild" | "scatter" | "jackpot" | "bonus";

export type Payouts = {
  three?: number;
  four?: number;
  five?: number;
};

export type SymbolConfig = {
  id: string;
  folderName: string;
  sourceFolderName?: string;
  displayName: string;
  type: SymbolType;
  assetPath?: string;
  fallbackColor: string;
  glowColor: string;
  payouts?: Payouts;
  weight: number;
  description?: string;
};

export type Payline = {
  id: string;
  name: string;
  positions: [number, number, number, number, number];
};

export type SlotGrid = string[][];

export type WinningPosition = {
  reel: number;
  row: number;
};

export type LineWin = {
  paylineId: string;
  paylineName: string;
  symbolId: string;
  matchCount: number;
  multiplier: number;
  amount: number;
  positions: WinningPosition[];
};

export type ScatterWin = {
  symbolId: string;
  count: number;
  multiplier: number;
  amount: number;
  positions: WinningPosition[];
};

export type JackpotWin = {
  symbolId: string;
  amount: number;
  paylineId: string;
  paylineName: string;
  positions: WinningPosition[];
};

export type SpinEvaluation = {
  lineWins: LineWin[];
  scatterWin: ScatterWin | null;
  jackpotWin: JackpotWin | null;
  scatterCount: number;
  freeSpinsAwarded: number;
  totalWin: number;
  winningPositions: WinningPosition[];
};

export type ReelStrip = string[];
export type ReelSet = [ReelStrip, ReelStrip, ReelStrip, ReelStrip, ReelStrip];
