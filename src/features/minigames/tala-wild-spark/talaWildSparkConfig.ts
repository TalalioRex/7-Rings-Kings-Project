import type { TalaObjectConfig } from "@/features/minigames/tala-wild-spark/types";

export const TALA_WILD_SPARK_DURATION_SECONDS = 30;
export const TALA_WILD_SPARK_HEALTH = 3;
export const TALA_WILD_SPARK_COMBO_WINDOW_MS = 1500;
export const TALA_WILD_SPARK_LANES = [0, 1, 2] as const;

export const TALA_COLLECTIBLES: TalaObjectConfig[] = [
  {
    id: "wild-spark",
    displayName: "Wild Spark",
    kind: "collectible",
    points: 50,
    spawnWeight: 36,
    color: "#ff4fd8",
    glyph: "SPARK"
  },
  {
    id: "ring-spark",
    displayName: "Ring Spark",
    kind: "collectible",
    points: 150,
    spawnWeight: 9,
    color: "#ffd166",
    glyph: "RING"
  },
  {
    id: "bonus-coin",
    displayName: "Bonus Coin",
    kind: "collectible",
    points: 100,
    spawnWeight: 13,
    color: "#5bffb5",
    glyph: "COIN"
  }
];

export const TALA_HAZARDS: TalaObjectConfig[] = [
  {
    id: "poisonous-sweet",
    displayName: "Poisonous Sweet",
    kind: "hazard",
    points: -100,
    spawnWeight: 22,
    color: "#9cff57",
    glyph: "TOXIC"
  },
  {
    id: "cursed-gummy-worm",
    displayName: "Cursed Gummy Worm",
    kind: "hazard",
    points: -100,
    spawnWeight: 18,
    color: "#b983ff",
    glyph: "GUMMY"
  },
  {
    id: "sour-strip-trap",
    displayName: "Sour Strip Trap",
    kind: "hazard",
    points: -75,
    spawnWeight: 14,
    color: "#8cfaff",
    glyph: "SOUR",
    effect: "slow"
  },
  {
    id: "lollipop-watcher",
    displayName: "Lollipop Watcher",
    kind: "hazard",
    points: -100,
    spawnWeight: 12,
    color: "#ff7488",
    glyph: "WATCH"
  },
  {
    id: "marshmallow-bouncer",
    displayName: "Marshmallow Bouncer",
    kind: "hazard",
    points: -100,
    spawnWeight: 10,
    color: "#fff6dd",
    glyph: "BOUNCE",
    effect: "knock"
  }
];

export const TALA_POWERUPS: TalaObjectConfig[] = [
  {
    id: "wild-spark-mode",
    displayName: "Wild Spark Mode",
    kind: "powerup",
    points: 100,
    spawnWeight: 7,
    color: "#ff4fd8",
    glyph: "WILD",
    effect: "wild-mode"
  },
  {
    id: "pippa-warning-signal",
    displayName: "Pippa Warning Signal",
    kind: "powerup",
    points: 100,
    spawnWeight: 6,
    color: "#fbff83",
    glyph: "WARN",
    effect: "warning"
  },
  {
    id: "heartstorm-bubble",
    displayName: "Heartstorm Bubble",
    kind: "powerup",
    points: 100,
    spawnWeight: 6,
    color: "#8cfaff",
    glyph: "SHIELD",
    effect: "shield"
  },
  {
    id: "velocity-dash",
    displayName: "Velocity Dash",
    kind: "powerup",
    points: 100,
    spawnWeight: 5,
    color: "#ff7488",
    glyph: "DASH",
    effect: "clear-hazards"
  }
];

export function getWeightedTalaObject(frenzy = false, random = Math.random): TalaObjectConfig {
  const pool = frenzy
    ? [...TALA_COLLECTIBLES, ...TALA_COLLECTIBLES, ...TALA_HAZARDS, ...TALA_POWERUPS]
    : [...TALA_COLLECTIBLES, ...TALA_HAZARDS, ...TALA_POWERUPS];
  return getWeightedItem(pool, random);
}

function getWeightedItem<T extends { spawnWeight: number }>(items: T[], random = Math.random): T {
  const totalWeight = items.reduce((total, item) => total + item.spawnWeight, 0);
  let cursor = random() * totalWeight;

  for (const item of items) {
    cursor -= item.spawnWeight;
    if (cursor <= 0) return item;
  }

  return items[0];
}
