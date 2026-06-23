import type { MiniGameReward } from "@/features/minigames/marcus-smash/types";

export type KazTileKind = "safe" | "cursed" | "false-safe" | "checkpoint" | "exit" | "blocked";

export type KazCollectibleId = "silent-strength-orb" | "ring-echo" | "mist-pearl" | "shield-seal";

export type KazPowerUpId = "silence-field" | "cyan-slash" | "jason-vision-ping" | "pippa-signal-lock" | "heartstorm-guard";

export type KazSpiritId = "glitch-sushi-spirit" | "freezer-fog-burst" | "sliding-shelf-shadow";

export type KazCell = {
  index: number;
  row: number;
  column: number;
  kind: KazTileKind;
  collectible?: KazCollectibleId;
  powerUp?: KazPowerUpId;
  spirit?: KazSpiritId;
  mistActive: boolean;
  safeGlowUntil: number;
};

export type KazPosition = {
  row: number;
  column: number;
};

export type KazColdMistReward = MiniGameReward & {
  source: "kaz-cold-mist";
};

export type KazColdMistResult = {
  score: number;
  bestCombo: number;
  heartsRemaining: number;
  stealth: number;
  distanceReached: number;
  exitReached: boolean;
  reward: KazColdMistReward;
  flavorText: string;
  endedByHealth: boolean;
};
