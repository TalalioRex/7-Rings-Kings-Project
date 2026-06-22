export const REEL_COUNT = 5;
export const ROW_COUNT = 3;
export const STARTING_BALANCE = 10000;
export const BET_OPTIONS = [10, 20, 50, 100, 200] as const;
export const DEFAULT_BET = 50;
export const WILD_SYMBOL_ID = "chuck-vadar";
export const SCATTER_SYMBOL_ID = "aisle-7-scatter";
export const JACKPOT_SYMBOL_ID = "shrimpie-the-seventh";
export const JACKPOT_SEED = 10000;
export const JACKPOT_CONTRIBUTION_RATE = 0.01;
export const JACKPOT_PAYLINE_ID = "any";

export const STORAGE_KEYS = {
  balance: "aisle7.balance",
  bet: "aisle7.bet",
  sound: "aisle7.sound",
  music: "aisle7.music",
  fastSpin: "aisle7.fastSpin",
  jackpot: "aisle7.jackpot"
} as const;
