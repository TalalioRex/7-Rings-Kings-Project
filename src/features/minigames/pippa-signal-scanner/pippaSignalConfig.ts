import type { PippaSignalTargetConfig } from "@/features/minigames/pippa-signal-scanner/types";

export const PIPPA_SIGNAL_DURATION_SECONDS = 30;
export const PIPPA_SIGNAL_COMBO_WINDOW_MS = 2000;
export const PIPPA_SIGNAL_COLUMNS = 4;
export const PIPPA_SIGNAL_ROWS = 3;
export const PIPPA_SIGNAL_CELL_COUNT = PIPPA_SIGNAL_COLUMNS * PIPPA_SIGNAL_ROWS;

export const PIPPA_SIGNAL_TARGETS: PippaSignalTargetConfig[] = [
  {
    id: "cursed-rubber-chicken",
    displayName: "Cursed Rubber Chicken",
    kind: "cursed",
    points: 100,
    interference: -5,
    spawnWeight: 18,
    color: "#ffd166",
    glyph: "CLUCK"
  },
  {
    id: "prank-gum-trap",
    displayName: "Prank Gum Trap",
    kind: "cursed",
    points: 100,
    interference: -5,
    spawnWeight: 16,
    color: "#ff7fe4",
    glyph: "GUM"
  },
  {
    id: "joy-buzzer-demon",
    displayName: "Joy Buzzer Demon",
    kind: "cursed",
    points: 120,
    interference: -6,
    spawnWeight: 13,
    color: "#8cfaff",
    glyph: "BUZZ"
  },
  {
    id: "fake-mustache-swarm",
    displayName: "Fake Mustache Swarm",
    kind: "cursed",
    points: 110,
    interference: -5,
    spawnWeight: 14,
    color: "#b983ff",
    glyph: "STACHE"
  },
  {
    id: "fart-spray-phantom",
    displayName: "Fart Spray Phantom",
    kind: "cursed",
    points: 130,
    interference: -7,
    spawnWeight: 11,
    color: "#9cff57",
    glyph: "SPRAY"
  },
  {
    id: "fake-ear-whisperer",
    displayName: "Fake Ear Whisperer",
    kind: "cursed",
    points: 125,
    interference: -6,
    spawnWeight: 11,
    color: "#ff7488",
    glyph: "EAR"
  },
  {
    id: "chuck-vadar-signal",
    displayName: "Chuck Vadar Signal",
    kind: "special",
    points: 300,
    interference: -10,
    spawnWeight: 4,
    color: "#ff4764",
    glyph: "WILD",
    requiredTaps: 2
  }
];

export const PIPPA_SIGNAL_DECOYS: PippaSignalTargetConfig[] = [
  {
    id: "harmless-rubber-chicken",
    displayName: "Harmless Rubber Chicken",
    kind: "decoy",
    points: -100,
    interference: 15,
    spawnWeight: 18,
    color: "#718096",
    glyph: "CHICK"
  },
  {
    id: "normal-prank-gum",
    displayName: "Normal Prank Gum",
    kind: "decoy",
    points: -100,
    interference: 15,
    spawnWeight: 16,
    color: "#64748b",
    glyph: "GUM"
  },
  {
    id: "ordinary-fake-mustache",
    displayName: "Ordinary Fake Mustache",
    kind: "decoy",
    points: -100,
    interference: 14,
    spawnWeight: 15,
    color: "#64748b",
    glyph: "FAKE"
  }
];

export const PIPPA_SIGNAL_TRAPS: PippaSignalTargetConfig[] = [
  {
    id: "static-burst",
    displayName: "Static Burst",
    kind: "trap",
    points: -150,
    interference: 24,
    spawnWeight: 12,
    color: "#8cfaff",
    glyph: "STATIC"
  },
  {
    id: "glitch-shelf",
    displayName: "Glitch Shelf",
    kind: "trap",
    points: -150,
    interference: 26,
    spawnWeight: 10,
    color: "#b983ff",
    glyph: "GLITCH"
  },
  {
    id: "laugh-track-curse",
    displayName: "Laugh Track Curse",
    kind: "trap",
    points: -150,
    interference: 28,
    spawnWeight: 9,
    color: "#ff7488",
    glyph: "LAUGH"
  }
];

export const PIPPA_SIGNAL_POWERUPS: PippaSignalTargetConfig[] = [
  {
    id: "jason-vision-ping",
    displayName: "Jason Vision Ping",
    kind: "powerup",
    points: 100,
    interference: -8,
    spawnWeight: 6,
    color: "#8cfaff",
    glyph: "VISION",
    effect: "reveal"
  },
  {
    id: "kaz-silence-field",
    displayName: "Kaz Silence Field",
    kind: "powerup",
    points: 100,
    interference: -6,
    spawnWeight: 6,
    color: "#5bffb5",
    glyph: "SILENCE",
    effect: "freeze-traps"
  },
  {
    id: "pascale-heartstorm-filter",
    displayName: "Pascale Heartstorm Filter",
    kind: "powerup",
    points: 100,
    interference: -8,
    spawnWeight: 6,
    color: "#ff9bea",
    glyph: "FILTER",
    effect: "remove-decoy"
  },
  {
    id: "tala-spark-glitch",
    displayName: "Tala Spark Glitch",
    kind: "powerup",
    points: 100,
    interference: 6,
    spawnWeight: 5,
    color: "#ff4fd8",
    glyph: "GLITCH",
    effect: "random-neutralize"
  },
  {
    id: "signal-stabilizer",
    displayName: "Signal Stabilizer",
    kind: "powerup",
    points: 100,
    interference: -25,
    spawnWeight: 7,
    color: "#ffd166",
    glyph: "STABLE",
    effect: "stabilize"
  }
];

export const PIPPA_EMPTY_TARGET: PippaSignalTargetConfig = {
  id: "empty-slot",
  displayName: "Empty Shelf Slot",
  kind: "empty",
  points: -50,
  interference: 8,
  spawnWeight: 1,
  color: "#475569",
  glyph: "EMPTY"
};

export function getWeightedPippaTarget(signalSurge = false, random = Math.random): PippaSignalTargetConfig {
  const pool = signalSurge
    ? [...PIPPA_SIGNAL_TARGETS, ...PIPPA_SIGNAL_TARGETS, ...PIPPA_SIGNAL_DECOYS, ...PIPPA_SIGNAL_TRAPS, ...PIPPA_SIGNAL_POWERUPS]
    : [...PIPPA_SIGNAL_TARGETS, ...PIPPA_SIGNAL_DECOYS, ...PIPPA_SIGNAL_TRAPS, ...PIPPA_SIGNAL_POWERUPS];
  return getWeightedItem(pool, random);
}

export function getWeightedPippaNonCursed(signalSurge = false, random = Math.random): PippaSignalTargetConfig {
  const pool = signalSurge ? [...PIPPA_SIGNAL_DECOYS, ...PIPPA_SIGNAL_TRAPS] : [...PIPPA_SIGNAL_DECOYS, ...PIPPA_SIGNAL_TRAPS, PIPPA_EMPTY_TARGET];
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
