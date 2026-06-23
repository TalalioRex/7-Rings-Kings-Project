import type {
  MarcusSmashFriendlyConfig,
  MarcusSmashPowerUpConfig,
  MarcusSmashTargetConfig
} from "@/features/minigames/marcus-smash/types";

export const MARCUS_SMASH_DURATION_SECONDS = 30;
export const MARCUS_SMASH_HEALTH = 3;
export const MARCUS_SMASH_COMBO_WINDOW_MS = 1200;
export const MARCUS_SMASH_GRID_COLUMNS = 3;
export const MARCUS_SMASH_GRID_ROWS = 3;

export const MARCUS_SMASH_TARGETS: MarcusSmashTargetConfig[] = [
  {
    id: "cursed-tofu",
    displayName: "Cursed Tofu Block",
    points: 50,
    spawnWeight: 32,
    color: "#d8ff9d",
    glyph: "TOFU"
  },
  {
    id: "angry-oat-milk",
    displayName: "Angry Oat Milk",
    points: 60,
    spawnWeight: 28,
    color: "#f7f0ca",
    glyph: "OAT"
  },
  {
    id: "haunted-almond-milk",
    displayName: "Haunted Almond Milk",
    points: 65,
    spawnWeight: 24,
    color: "#fff6dd",
    glyph: "ALMOND"
  },
  {
    id: "plant-burger",
    displayName: "Plant Burger Goblin",
    points: 75,
    spawnWeight: 22,
    color: "#70f08a",
    glyph: "BURGER"
  },
  {
    id: "vegan-protein-bar",
    displayName: "Vegan Protein Bar",
    points: 100,
    spawnWeight: 14,
    color: "#b983ff",
    glyph: "PROTEIN"
  },
  {
    id: "evil-chickpea-can",
    displayName: "Evil Chickpea Can",
    points: 95,
    spawnWeight: 15,
    color: "#f7ff4a",
    glyph: "CAN"
  },
  {
    id: "fake-cheese-slice",
    displayName: "Fake Cheese Slice",
    points: 110,
    spawnWeight: 12,
    color: "#ffd166",
    glyph: "CHEESE"
  },
  {
    id: "possessed-kale",
    displayName: "Possessed Kale",
    points: 125,
    spawnWeight: 10,
    color: "#5bffb5",
    glyph: "KALE"
  },
  {
    id: "tempeh-gremlin",
    displayName: "Tempeh Gremlin",
    points: 135,
    spawnWeight: 8,
    color: "#ff7488",
    glyph: "TEMPEH"
  }
];

export const MARCUS_SMASH_FRIENDLIES: MarcusSmashFriendlyConfig[] = [
  {
    id: "pippa-scanner-beacon",
    displayName: "Pippa Scanner Beacon",
    penalty: 100,
    spawnWeight: 12,
    color: "#fbff83",
    glyph: "PIPPA"
  },
  {
    id: "kaz-cold-marker",
    displayName: "Kaz Cold Marker",
    penalty: 100,
    spawnWeight: 10,
    color: "#8cfaff",
    glyph: "KAZ"
  },
  {
    id: "safe-snack",
    displayName: "Safe Snack",
    penalty: 75,
    spawnWeight: 14,
    color: "#ffffff",
    glyph: "SAFE"
  },
  {
    id: "bonus-ring-spark",
    displayName: "Bonus Ring Spark",
    penalty: 50,
    spawnWeight: 8,
    color: "#ff7fe4",
    glyph: "RING"
  }
];

export const MARCUS_SMASH_POWERUPS: MarcusSmashPowerUpConfig[] = [
  {
    id: "red-velocity-slam",
    displayName: "Red Velocity Slam",
    spawnWeight: 8,
    color: "#ff4764",
    glyph: "SLAM",
    description: "Clears one full row."
  },
  {
    id: "marcus-rage",
    displayName: "Marcus Rage",
    spawnWeight: 7,
    color: "#ff7488",
    glyph: "RAGE",
    description: "Doubles points for 5 seconds."
  },
  {
    id: "kaz-freeze",
    displayName: "Kaz Freeze",
    spawnWeight: 6,
    color: "#8cfaff",
    glyph: "FREEZE",
    description: "Freezes targets for 3 seconds."
  },
  {
    id: "pippa-scan",
    displayName: "Pippa Scan",
    spawnWeight: 6,
    color: "#fbff83",
    glyph: "SCAN",
    description: "Suppresses friendly targets for 4 seconds."
  },
  {
    id: "tala-chaos-spark",
    displayName: "Tala Chaos Spark",
    spawnWeight: 5,
    color: "#ff7fe4",
    glyph: "CHAOS",
    description: "Smashes 3 enemies."
  }
];

export function getWeightedMarcusTarget(random = Math.random): MarcusSmashTargetConfig {
  return getWeightedItem(MARCUS_SMASH_TARGETS, random);
}

export function getWeightedMarcusFriendly(random = Math.random): MarcusSmashFriendlyConfig {
  return getWeightedItem(MARCUS_SMASH_FRIENDLIES, random);
}

export function getWeightedMarcusPowerUp(random = Math.random): MarcusSmashPowerUpConfig {
  return getWeightedItem(MARCUS_SMASH_POWERUPS, random);
}

function getWeightedItem<T extends { spawnWeight: number }>(items: T[], random = Math.random): T {
  const totalWeight = items.reduce((total, item) => total + item.spawnWeight, 0);
  let cursor = random() * totalWeight;

  for (const item of items) {
    cursor -= item.spawnWeight;
    if (cursor <= 0) {
      return item;
    }
  }

  return items[0];
}
