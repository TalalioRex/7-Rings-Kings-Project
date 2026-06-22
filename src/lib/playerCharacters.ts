export type PlayerCharacterId = "tala" | "jason" | "kaz" | "marcus" | "pascal" | "pippa";

export type PlayerCharacter = {
  id: PlayerCharacterId;
  displayName: string;
  signalName: string;
  assetPath: string;
  glowColor: string;
  bonusTitle: string;
  bonusSummary: string;
  bonusDetail: string;
};

export const PLAYER_CHARACTERS: PlayerCharacter[] = [
  {
    id: "tala",
    displayName: "Tala",
    signalName: "Wild Spark",
    assetPath: "/assets/characters/tala.png",
    glowColor: "#ff7fe4",
    bonusTitle: "Spark Charge",
    bonusSummary: "Prototype feature teaser for future bonus ideas.",
    bonusDetail: "Future feature preview: repeated Wild hits could charge a character meter in a later phase."
  },
  {
    id: "jason",
    displayName: "Jason",
    signalName: "Vision",
    assetPath: "/assets/characters/jason.png",
    glowColor: "#8dffd0",
    bonusTitle: "Vision Peek",
    bonusSummary: "Prototype feature teaser for future bonus ideas.",
    bonusDetail: "Future feature preview: Jason could later preview the closest active payline."
  },
  {
    id: "kaz",
    displayName: "Kaz",
    signalName: "Silent Strength",
    assetPath: "/assets/characters/kaz.png",
    glowColor: "#8cfaff",
    bonusTitle: "Steady Reel",
    bonusSummary: "Prototype feature teaser for future bonus ideas.",
    bonusDetail: "Future feature preview: one reel could later lock for a bonus spin."
  },
  {
    id: "marcus",
    displayName: "Marcus",
    signalName: "Velocity",
    assetPath: "/assets/characters/marcus.png",
    glowColor: "#ff7488",
    bonusTitle: "Rush Spin",
    bonusSummary: "Prototype feature teaser for future bonus ideas.",
    bonusDetail: "Future feature preview: Marcus could later speed up bonus rounds."
  },
  {
    id: "pascal",
    displayName: "Pascal",
    signalName: "Heartstorm",
    assetPath: "/assets/characters/pascal.png",
    glowColor: "#be92ff",
    bonusTitle: "Heart Shield",
    bonusSummary: "Prototype feature teaser for future bonus ideas.",
    bonusDetail: "Future feature preview: Pascal could later soften cold streaks."
  },
  {
    id: "pippa",
    displayName: "Pippa",
    signalName: "Signal",
    assetPath: "/assets/characters/pippa.png",
    glowColor: "#fbff83",
    bonusTitle: "Signal Boost",
    bonusSummary: "Prototype feature teaser for future bonus ideas.",
    bonusDetail: "Future feature preview: Pippa could later amplify scatter anticipation."
  }
];

export const DEFAULT_PLAYER_CHARACTER_ID: PlayerCharacterId = "tala";

export function getPlayerCharacter(characterId: string): PlayerCharacter {
  return PLAYER_CHARACTERS.find((character) => character.id === characterId) ?? PLAYER_CHARACTERS[0];
}
