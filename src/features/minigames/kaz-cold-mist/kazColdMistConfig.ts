import type { KazCell, KazCollectibleId, KazPowerUpId, KazSpiritId, KazTileKind } from "@/features/minigames/kaz-cold-mist/types";

export const KAZ_COLD_MIST_DURATION_SECONDS = 35;
export const KAZ_COLD_MIST_HEALTH = 3;
export const KAZ_COLD_MIST_START_STEALTH = 100;
export const KAZ_COLD_MIST_COMBO_WINDOW_MS = 2000;
export const KAZ_COLD_MIST_COLUMNS = 6;
export const KAZ_COLD_MIST_ROWS = 4;
export const KAZ_COLD_MIST_CELL_COUNT = KAZ_COLD_MIST_COLUMNS * KAZ_COLD_MIST_ROWS;

const START_INDEX = 0;
const EXIT_INDEX = KAZ_COLD_MIST_CELL_COUNT - 1;

export const KAZ_COLLECTIBLE_POINTS: Record<KazCollectibleId, number> = {
  "silent-strength-orb": 50,
  "ring-echo": 150,
  "mist-pearl": 100,
  "shield-seal": 0
};

export const KAZ_POWERUP_LABELS: Record<KazPowerUpId, string> = {
  "silence-field": "Silence Field",
  "cyan-slash": "Cyan Slash",
  "jason-vision-ping": "Jason Vision Ping",
  "pippa-signal-lock": "Pippa Signal Lock",
  "heartstorm-guard": "Heartstorm Guard"
};

export const KAZ_SPIRIT_LABELS: Record<KazSpiritId, string> = {
  "glitch-sushi-spirit": "Glitch Sushi Spirit",
  "freezer-fog-burst": "Freezer Fog Burst",
  "sliding-shelf-shadow": "Sliding Shelf Shadow"
};

export function createKazBoard(): KazCell[] {
  return Array.from({ length: KAZ_COLD_MIST_CELL_COUNT }, (_, index) => {
    const row = Math.floor(index / KAZ_COLD_MIST_COLUMNS);
    const column = index % KAZ_COLD_MIST_COLUMNS;
    const kind = getInitialTileKind(index);
    return {
      index,
      row,
      column,
      kind,
      collectible: getInitialCollectible(index),
      powerUp: getInitialPowerUp(index),
      spirit: getInitialSpirit(index),
      mistActive: false,
      safeGlowUntil: 0
    };
  });
}

export function getTileDistanceScore(row: number, column: number) {
  return row * KAZ_COLD_MIST_COLUMNS + column;
}

function getInitialTileKind(index: number): KazTileKind {
  if (index === START_INDEX) return "safe";
  if (index === EXIT_INDEX) return "exit";
  if ([7, 16].includes(index)) return "checkpoint";
  if ([9, 14, 20].includes(index)) return "cursed";
  if ([5, 12, 18].includes(index)) return "false-safe";
  if ([10, 21].includes(index)) return "blocked";
  return "safe";
}

function getInitialCollectible(index: number): KazCollectibleId | undefined {
  if (index === 3 || index === 17) return "silent-strength-orb";
  if (index === 11) return "ring-echo";
  if (index === 8 || index === 19) return "mist-pearl";
  if (index === 22) return "shield-seal";
  return undefined;
}

function getInitialPowerUp(index: number): KazPowerUpId | undefined {
  if (index === 6) return "silence-field";
  if (index === 13) return "cyan-slash";
  if (index === 15) return "jason-vision-ping";
  if (index === 4) return "pippa-signal-lock";
  if (index === 2) return "heartstorm-guard";
  return undefined;
}

function getInitialSpirit(index: number): KazSpiritId | undefined {
  if (index === 9) return "glitch-sushi-spirit";
  if (index === 14) return "freezer-fog-burst";
  if (index === 20) return "sliding-shelf-shadow";
  return undefined;
}
