import type { PippaScannerResult, PippaScannerReward } from "@/features/minigames/pippa-signal-scanner/types";

export function getPippaSignalReward(
  score: number,
  bestCombo = 0,
  finalInterference = 100,
  chuckDetected = false
): PippaScannerReward {
  const comboBonusFreeSpin = bestCombo >= 10 ? 1 : 0;
  const cleanSignalCoinBonus = finalInterference < 25 ? 250 : 0;
  const chuckBonusFreeSpin = chuckDetected ? 1 : 0;
  const bonusFreeSpins = comboBonusFreeSpin + chuckBonusFreeSpin;

  if (score >= 3500) {
    return {
      coins: 2000 + cleanSignalCoinBonus,
      freeSpins: 5 + bonusFreeSpins,
      nextSpinMultiplier: 2,
      source: "pippa-signal-scanner"
    };
  }

  if (score >= 2500) {
    return { coins: 1500 + cleanSignalCoinBonus, freeSpins: 5 + bonusFreeSpins, source: "pippa-signal-scanner" };
  }

  if (score >= 1500) {
    return { coins: 1000 + cleanSignalCoinBonus, freeSpins: 3 + bonusFreeSpins, source: "pippa-signal-scanner" };
  }

  if (score >= 1000) {
    return { coins: 750 + cleanSignalCoinBonus, freeSpins: 1 + bonusFreeSpins, source: "pippa-signal-scanner" };
  }

  if (score >= 500) {
    return { coins: 500 + cleanSignalCoinBonus, freeSpins: bonusFreeSpins, source: "pippa-signal-scanner" };
  }

  return { coins: 250 + cleanSignalCoinBonus, freeSpins: bonusFreeSpins, source: "pippa-signal-scanner" };
}

export function getPippaSignalResult(
  score: number,
  bestCombo = 0,
  finalInterference = 0,
  neutralizedCount = 0,
  chuckDetected = false,
  endedByInterference = false
): PippaScannerResult {
  const reward = getPippaSignalReward(score, bestCombo, finalInterference, chuckDetected);
  const flavorText = endedByInterference
    ? "The rubber chickens have jammed the signal."
    : finalInterference < 25 && score >= 1500
      ? "Signal clean. Pippa approves. Barely."
      : score >= 3000
        ? "Pippa has cancelled the chaos."
        : score >= 1200
          ? "Signal stabilized. Mostly."
          : "The prank aisle remains suspicious.";

  return { score, bestCombo, finalInterference, neutralizedCount, chuckDetected, reward, flavorText, endedByInterference };
}
