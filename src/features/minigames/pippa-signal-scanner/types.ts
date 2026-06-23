import type { MiniGameReward } from "@/features/minigames/marcus-smash/types";

export type PippaSignalKind = "cursed" | "decoy" | "trap" | "powerup" | "special" | "empty";

export type PippaSignalTargetId =
  | "cursed-rubber-chicken"
  | "prank-gum-trap"
  | "joy-buzzer-demon"
  | "fake-mustache-swarm"
  | "fart-spray-phantom"
  | "fake-ear-whisperer"
  | "chuck-vadar-signal"
  | "harmless-rubber-chicken"
  | "normal-prank-gum"
  | "ordinary-fake-mustache"
  | "static-burst"
  | "glitch-shelf"
  | "laugh-track-curse"
  | "jason-vision-ping"
  | "kaz-silence-field"
  | "pascale-heartstorm-filter"
  | "tala-spark-glitch"
  | "signal-stabilizer"
  | "empty-slot";

export type PippaSignalTargetConfig = {
  id: PippaSignalTargetId;
  displayName: string;
  kind: PippaSignalKind;
  points: number;
  interference: number;
  spawnWeight: number;
  color: string;
  glyph: string;
  requiredTaps?: number;
  effect?: "reveal" | "freeze-traps" | "remove-decoy" | "random-neutralize" | "stabilize";
};

export type PippaShelfCell = {
  id: string;
  index: number;
  config: PippaSignalTargetConfig;
  tapsRemaining: number;
  revealedUntil: number;
};

export type PippaScannerReward = MiniGameReward & {
  source: "pippa-signal-scanner";
};

export type PippaScannerResult = {
  score: number;
  bestCombo: number;
  finalInterference: number;
  neutralizedCount: number;
  chuckDetected: boolean;
  reward: PippaScannerReward;
  flavorText: string;
  endedByInterference: boolean;
};
