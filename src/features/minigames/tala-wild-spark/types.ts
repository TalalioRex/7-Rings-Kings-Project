import type { MiniGameReward } from "@/features/minigames/marcus-smash/types";

export type TalaLane = 0 | 1 | 2;

export type TalaCollectibleId = "wild-spark" | "ring-spark" | "bonus-coin";

export type TalaHazardId =
  | "poisonous-sweet"
  | "cursed-gummy-worm"
  | "sour-strip-trap"
  | "lollipop-watcher"
  | "marshmallow-bouncer";

export type TalaPowerUpId = "wild-spark-mode" | "pippa-warning-signal" | "heartstorm-bubble" | "velocity-dash";

export type TalaObjectKind = "collectible" | "hazard" | "powerup";

export type TalaObjectConfig = {
  id: TalaCollectibleId | TalaHazardId | TalaPowerUpId;
  displayName: string;
  kind: TalaObjectKind;
  points: number;
  spawnWeight: number;
  color: string;
  glyph: string;
  effect?: "shield" | "wild-mode" | "warning" | "clear-hazards" | "slow" | "knock";
};

export type TalaFallingObject = {
  id: string;
  lane: TalaLane;
  y: number;
  speed: number;
  config: TalaObjectConfig;
};

export type TalaWildSparkReward = MiniGameReward & {
  source: "tala-wild-spark";
  talaJackpotBoost?: number;
};

export type TalaWildSparkResult = {
  score: number;
  bestCombo: number;
  healthRemaining: number;
  sparksCollected: number;
  reward: TalaWildSparkReward;
  flavorText: string;
  endedByHealth: boolean;
};
