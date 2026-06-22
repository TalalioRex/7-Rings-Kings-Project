import type { SymbolConfig } from "@/types/slot";

export const SYMBOLS: SymbolConfig[] = [
  {
    id: "shrimpie-the-seventh",
    folderName: "Shrimpie the Seventh",
    sourceFolderName: "Slot Assets/Shrimpie the Seventh",
    displayName: "Shrimpie the Seventh",
    type: "jackpot",
    assetPath: "/assets/jackpot/shrimpie-the-seventh/symbol.png",
    fallbackColor: "#ffd166",
    glowColor: "#ffd166",
    payouts: { three: 50, four: 250, five: 1000 },
    weight: 1,
    description: "Jackpot symbol. Shrimpie is the rare premium Seventh King symbol. Wilds do not substitute for Shrimpie in Phase 1."
  },
  {
    id: "lord-swizzlepop",
    folderName: "Lord Swizzlepop",
    sourceFolderName: "Slot Assets/Lord Swizzlepop",
    displayName: "Lord Swizzlepop",
    type: "regular",
    assetPath: "/assets/slot-symbols/lord-swizzlepop/symbol.png",
    fallbackColor: "#8d5cff",
    glowColor: "#b983ff",
    payouts: { three: 4, four: 12, five: 45 },
    weight: 6,
    description: "High-value cursed candy royalty."
  },
  {
    id: "sourcerer-sash",
    folderName: "Sourcerer Sash",
    sourceFolderName: "Slot Assets/Sourcerer Sash",
    displayName: "Sourcerer Sash",
    type: "regular",
    assetPath: "/assets/slot-symbols/sourcerer-sash/symbol.png",
    fallbackColor: "#0fe7c8",
    glowColor: "#4ef6dc",
    payouts: { three: 4, four: 12, five: 45 },
    weight: 6,
    description: "High-value magical aisle symbol."
  },
  {
    id: "grand-lolliwick",
    folderName: "Grand Lolliwick",
    sourceFolderName: "Slot Assets/Grand Lolliwick",
    displayName: "Grand Lolliwick",
    type: "regular",
    assetPath: "/assets/slot-symbols/grand-lolliwick/symbol.png",
    fallbackColor: "#ff5fc8",
    glowColor: "#ff93dc",
    payouts: { three: 3, four: 8, five: 28 },
    weight: 8,
    description: "Medium-value candy court symbol."
  },
  {
    id: "marshal-mallow",
    folderName: "Marshal Mallow",
    sourceFolderName: "Slot Assets/Marshal Mallow",
    displayName: "Marshal Mallow",
    type: "regular",
    assetPath: "/assets/slot-symbols/marshal-mallow/symbol.png",
    fallbackColor: "#ffe3f6",
    glowColor: "#ff9ee6",
    payouts: { three: 3, four: 8, five: 28 },
    weight: 8,
    description: "Medium-value soft threat from the candy aisle."
  },
  {
    id: "master-nigiri",
    folderName: "Master Nigiri",
    sourceFolderName: "Slot Assets/Master Nigiri",
    displayName: "Master Nigiri",
    type: "regular",
    assetPath: "/assets/slot-symbols/master-nigiri/symbol.png",
    fallbackColor: "#50b6ff",
    glowColor: "#83d6ff",
    payouts: { three: 3, four: 8, five: 28 },
    weight: 8,
    description: "Medium-value cold aisle guardian."
  },
  {
    id: "blinky-bluewig",
    folderName: "Blinky Bluewig",
    sourceFolderName: "Slot Assets/Blinky Bluewig",
    displayName: "Blinky Bluewig",
    type: "regular",
    assetPath: "/assets/slot-symbols/blinky-bluewig/symbol.png",
    fallbackColor: "#2d7cff",
    glowColor: "#66a5ff",
    payouts: { three: 1, four: 4, five: 15 },
    weight: 12,
    description: "Low-value neon aisle nuisance."
  },
  {
    id: "ziggy-zestwig",
    folderName: "Ziggy Zestwig",
    sourceFolderName: "Slot Assets/Ziggy Zestwig",
    displayName: "Ziggy Zestwig",
    type: "regular",
    assetPath: "/assets/slot-symbols/ziggy-zestwig/symbol.png",
    fallbackColor: "#f7ff4a",
    glowColor: "#fbff83",
    payouts: { three: 1, four: 4, five: 15 },
    weight: 12,
    description: "Low-value zesty aisle creature."
  },
  {
    id: "chuck-vadar",
    folderName: "Chuck Vadar",
    sourceFolderName: "Slot Assets/Chuck Vadar",
    displayName: "Chuck Vadar Wild",
    type: "wild",
    assetPath: "/assets/slot-symbols/chuck-vadar/symbol.png",
    fallbackColor: "#ff2c4d",
    glowColor: "#ff6177",
    weight: 3,
    description: "Wild. Substitutes for regular symbols only; never for Scatter or Shrimpie Jackpot."
  },
  {
    id: "aisle-7-scatter",
    folderName: "Generated Placeholder",
    sourceFolderName: "No source image found during full project scan",
    displayName: "Aisle 7 Scatter",
    type: "scatter",
    fallbackColor: "#13f2aa",
    glowColor: "#65ffd2",
    weight: 2,
    description: "Scatter placeholder. Three or more anywhere trigger free spins."
  }
];

export const SYMBOL_MAP = new Map(SYMBOLS.map((symbol) => [symbol.id, symbol]));

export function getSymbol(symbolId: string): SymbolConfig {
  const symbol = SYMBOL_MAP.get(symbolId);
  if (!symbol) {
    throw new Error(`Unknown symbol id: ${symbolId}`);
  }
  return symbol;
}

export function getRegularSymbols(): SymbolConfig[] {
  return SYMBOLS.filter((symbol) => symbol.type === "regular");
}
