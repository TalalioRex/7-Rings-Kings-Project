export type PlayerCharacterId = "tala" | "pippa" | "pascal" | "marcus" | "jason" | "kaz";

export type PlayerCharacter = {
  id: PlayerCharacterId;
  displayName: string;
  ringTitle: string;
  signalName: string;
  assetPath: string;
  sourceFolderName: string;
  glowColor: string;
  description: string;
  bonusTitle: string;
  bonusSummary: string;
  bonusDetail: string;
};

export const PLAYER_CHARACTERS: PlayerCharacter[] = [
  {
    id: "tala",
    displayName: "Tala",
    ringTitle: "Pink Ring Signal",
    signalName: "Wild Spark",
    assetPath: "/assets/characters/tala.png",
    sourceFolderName: "Slot Assets/Main Characters",
    glowColor: "#ff7fe4",
    description: "Tala is the current demo driver for the prototype jackpot boost.",
    bonusTitle: "Prototype Demo Feature",
    bonusSummary: "Demo Jackpot Boost counts paid spins toward a guaranteed Shrimpie jackpot.",
    bonusDetail: "Fake-money prototype behavior: Tala paid spin 1 shows 1/3, spin 2 shows 2/3, and spin 3 forces a real Shrimpie jackpot grid through the slot engine."
  },
  {
    id: "pippa",
    displayName: "Pippa",
    ringTitle: "Yellow Ring Signal",
    signalName: "Signal Boost",
    assetPath: "/assets/characters/pippa.png",
    sourceFolderName: "Slot Assets/Main Characters",
    glowColor: "#fbff83",
    description: "Pippa is reserved for future scatter and signal-style prototype ideas.",
    bonusTitle: "Future Feature Preview",
    bonusSummary: "Locked preview for later character mechanics.",
    bonusDetail: "Future feature preview only. Pippa does not change reel math in this phase."
  },
  {
    id: "pascal",
    displayName: "Pascal",
    ringTitle: "Purple Ring Signal",
    signalName: "Heartstorm",
    assetPath: "/assets/characters/pascal.png",
    sourceFolderName: "Slot Assets/Main Characters",
    glowColor: "#be92ff",
    description: "Pascal is held for future defensive or recovery-style prototype ideas.",
    bonusTitle: "Future Feature Preview",
    bonusSummary: "Locked preview for later character mechanics.",
    bonusDetail: "Future feature preview only. Pascal does not change reel math in this phase."
  },
  {
    id: "marcus",
    displayName: "Marcus",
    ringTitle: "Red Ring Signal",
    signalName: "Velocity",
    assetPath: "/assets/characters/marcus.png",
    sourceFolderName: "Slot Assets/Main Characters",
    glowColor: "#ff7488",
    description: "Marcus is reserved for future speed and momentum-style prototype ideas.",
    bonusTitle: "Future Feature Preview",
    bonusSummary: "Locked preview for later character mechanics.",
    bonusDetail: "Future feature preview only. Marcus does not change reel math in this phase."
  },
  {
    id: "jason",
    displayName: "Jason",
    ringTitle: "Green Ring Signal",
    signalName: "Vision",
    assetPath: "/assets/characters/jason.png",
    sourceFolderName: "Slot Assets/Main Characters",
    glowColor: "#8dffd0",
    description: "Jason is reserved for future preview and readout-style prototype ideas.",
    bonusTitle: "Future Feature Preview",
    bonusSummary: "Locked preview for later character mechanics.",
    bonusDetail: "Future feature preview only. Jason does not change reel math in this phase."
  },
  {
    id: "kaz",
    displayName: "Kaz",
    ringTitle: "Cyan Ring Signal",
    signalName: "Silent Strength",
    assetPath: "/assets/characters/kaz.png",
    sourceFolderName: "Slot Assets/Main Characters",
    glowColor: "#8cfaff",
    description: "Kaz is reserved for future steady-reel and lock-style prototype ideas.",
    bonusTitle: "Future Feature Preview",
    bonusSummary: "Locked preview for later character mechanics.",
    bonusDetail: "Future feature preview only. Kaz does not change reel math in this phase."
  }
];

export const DEFAULT_PLAYER_CHARACTER_ID: PlayerCharacterId = "tala";

export function getPlayerCharacter(characterId: string): PlayerCharacter {
  return PLAYER_CHARACTERS.find((character) => character.id === characterId) ?? PLAYER_CHARACTERS[0];
}
