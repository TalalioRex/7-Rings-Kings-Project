export type MarcusSmashTargetId =
  | "cursed-tofu"
  | "angry-oat-milk"
  | "haunted-almond-milk"
  | "plant-burger"
  | "vegan-protein-bar"
  | "evil-chickpea-can"
  | "fake-cheese-slice"
  | "possessed-kale"
  | "tempeh-gremlin";

export type MarcusSmashFriendlyId = "pippa-scanner-beacon" | "kaz-cold-marker" | "safe-snack" | "bonus-ring-spark";

export type MarcusSmashPowerUpId = "red-velocity-slam" | "marcus-rage" | "kaz-freeze" | "pippa-scan" | "tala-chaos-spark";

export type MarcusSmashTargetConfig = {
  id: MarcusSmashTargetId;
  displayName: string;
  points: number;
  spawnWeight: number;
  color: string;
  glyph: string;
};

export type MarcusSmashFriendlyConfig = {
  id: MarcusSmashFriendlyId;
  displayName: string;
  penalty: number;
  spawnWeight: number;
  color: string;
  glyph: string;
};

export type MarcusSmashPowerUpConfig = {
  id: MarcusSmashPowerUpId;
  displayName: string;
  spawnWeight: number;
  color: string;
  glyph: string;
  description: string;
};

export type MiniGameReward = {
  coins: number;
  freeSpins: number;
  nextSpinMultiplier?: number;
  addWilds?: number;
  talaJackpotBoost?: number;
  source: "marcus-smash" | "tala-wild-spark" | "pippa-signal-scanner" | "kaz-cold-mist";
};

export type MarcusSmashResult = {
  score: number;
  bestCombo: number;
  healthRemaining: number;
  reward: MiniGameReward;
  flavorText: string;
  endedByHealth: boolean;
};

export type MarcusSmashHudState = {
  score: number;
  combo: number;
  bestCombo: number;
  health: number;
  remainingSeconds: number;
  frenzy: boolean;
  message: string;
};
