import type { TalaWildSparkResult, TalaWildSparkReward } from "@/features/minigames/tala-wild-spark/types";

export function getTalaWildSparkReward(score: number, bestCombo = 0, healthRemaining = 0): TalaWildSparkReward {
  const comboBonusFreeSpin = bestCombo >= 10 ? 1 : 0;
  const fullHealthCoinBonus = healthRemaining >= 3 ? 250 : 0;

  if (score >= 3500) {
    return {
      coins: 2000 + fullHealthCoinBonus,
      freeSpins: 5 + comboBonusFreeSpin,
      talaJackpotBoost: 1,
      source: "tala-wild-spark"
    };
  }

  if (score >= 2500) {
    return { coins: 1500 + fullHealthCoinBonus, freeSpins: 5 + comboBonusFreeSpin, source: "tala-wild-spark" };
  }

  if (score >= 1500) {
    return { coins: 1000 + fullHealthCoinBonus, freeSpins: 3 + comboBonusFreeSpin, source: "tala-wild-spark" };
  }

  if (score >= 1000) {
    return { coins: 750 + fullHealthCoinBonus, freeSpins: 1 + comboBonusFreeSpin, source: "tala-wild-spark" };
  }

  if (score >= 500) {
    return { coins: 500 + fullHealthCoinBonus, freeSpins: comboBonusFreeSpin, source: "tala-wild-spark" };
  }

  return { coins: 250 + fullHealthCoinBonus, freeSpins: comboBonusFreeSpin, source: "tala-wild-spark" };
}

export function getTalaWildSparkResult(
  score: number,
  bestCombo = 0,
  healthRemaining = 0,
  sparksCollected = 0,
  endedByHealth = false
): TalaWildSparkResult {
  const reward = getTalaWildSparkReward(score, bestCombo, healthRemaining);
  const flavorText = endedByHealth
    ? "Tala touched the forbidden candy. Again."
    : healthRemaining >= 3 && score >= 2500
      ? "Tala has achieved forbidden candy enlightenment."
      : score >= 3500
        ? "Wild Spark energy has entered the snacks."
        : score >= 1500
          ? "Tala survived the candy aisle. Technically."
          : "Pippa was right. Nobody tell her.";

  return { score, bestCombo, healthRemaining, sparksCollected, reward, flavorText, endedByHealth };
}
