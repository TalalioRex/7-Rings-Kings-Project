import type { KazColdMistResult, KazColdMistReward } from "@/features/minigames/kaz-cold-mist/types";

export function getKazColdMistReward(
  score: number,
  exitReached = false,
  heartsRemaining = 0,
  stealth = 0
): KazColdMistReward {
  const exitCoinBonus = exitReached ? 500 : 0;
  const perfectHealthCoinBonus = heartsRemaining >= 3 ? 250 : 0;
  const stealthBonusFreeSpin = stealth > 75 ? 1 : 0;
  const bonusCoins = exitCoinBonus + perfectHealthCoinBonus;

  if (score >= 3500) {
    return {
      coins: 2000 + bonusCoins,
      freeSpins: 5 + stealthBonusFreeSpin,
      nextSpinMultiplier: 2,
      source: "kaz-cold-mist"
    };
  }

  if (score >= 2500) {
    return { coins: 1500 + bonusCoins, freeSpins: 5 + stealthBonusFreeSpin, source: "kaz-cold-mist" };
  }

  if (score >= 1500) {
    return { coins: 1000 + bonusCoins, freeSpins: 3 + stealthBonusFreeSpin, source: "kaz-cold-mist" };
  }

  if (score >= 1000) {
    return { coins: 750 + bonusCoins, freeSpins: 1 + stealthBonusFreeSpin, source: "kaz-cold-mist" };
  }

  if (score >= 500) {
    return { coins: 500 + bonusCoins, freeSpins: stealthBonusFreeSpin, source: "kaz-cold-mist" };
  }

  return { coins: 250 + bonusCoins, freeSpins: stealthBonusFreeSpin, source: "kaz-cold-mist" };
}

export function getKazColdMistResult(
  score: number,
  bestCombo = 0,
  heartsRemaining = 0,
  stealth = 0,
  distanceReached = 0,
  exitReached = false,
  endedByHealth = false
): KazColdMistResult {
  const reward = getKazColdMistReward(score, exitReached, heartsRemaining, stealth);
  const flavorText = endedByHealth
    ? "The mist has become rude."
    : exitReached && heartsRemaining >= 3 && stealth > 75
      ? "The shelf never knew Kaz was there."
      : exitReached
        ? "Kaz crossed the aisle without disturbing destiny."
        : score >= 1200
          ? "Silent enough. Mostly."
          : "The mist noticed you. Kaz did not approve.";

  return { score, bestCombo, heartsRemaining, stealth, distanceReached, exitReached, reward, flavorText, endedByHealth };
}
