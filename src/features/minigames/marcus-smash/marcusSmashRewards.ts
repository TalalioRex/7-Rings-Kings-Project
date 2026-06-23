import type { MarcusSmashResult, MiniGameReward } from "@/features/minigames/marcus-smash/types";

export function getMarcusSmashReward(score: number, bestCombo = 0, healthRemaining = 0): MiniGameReward {
  const comboBonusFreeSpin = bestCombo >= 10 ? 1 : 0;
  const fullHealthCoinBonus = healthRemaining >= 3 ? 250 : 0;

  if (score >= 2500) {
    return { coins: 1500 + fullHealthCoinBonus, freeSpins: 5 + comboBonusFreeSpin, nextSpinMultiplier: 2, source: "marcus-smash" };
  }

  if (score >= 1500) {
    return { coins: 1000 + fullHealthCoinBonus, freeSpins: 3 + comboBonusFreeSpin, source: "marcus-smash" };
  }

  if (score >= 1000) {
    return { coins: 750 + fullHealthCoinBonus, freeSpins: 1 + comboBonusFreeSpin, source: "marcus-smash" };
  }

  if (score >= 500) {
    return { coins: 500 + fullHealthCoinBonus, freeSpins: comboBonusFreeSpin, source: "marcus-smash" };
  }

  return { coins: 250 + fullHealthCoinBonus, freeSpins: comboBonusFreeSpin, source: "marcus-smash" };
}

export function getMarcusSmashResult(score: number, bestCombo = 0, healthRemaining = 0, endedByHealth = false): MarcusSmashResult {
  const reward = getMarcusSmashReward(score, bestCombo, healthRemaining);
  const flavorText = endedByHealth
    ? "The vegan shelf wins this round."
    : healthRemaining >= 3 && score >= 1500
      ? "Marcus refuses to be defeated by tofu."
      : score >= 2500
        ? "The vegan shelf has been emotionally corrected."
        : score >= 1000
          ? "Marcus has restored aisle discipline."
          : "The oat milk survives. For now.";

  return { score, bestCombo, healthRemaining, reward, flavorText, endedByHealth };
}
