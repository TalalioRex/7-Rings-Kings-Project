"use client";

import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ModeSelect } from "@/components/ModeSelect";
import { SlotMachine } from "@/components/SlotMachine";
import { TitleScreen } from "@/components/TitleScreen";
import { KazColdMistPath } from "@/features/minigames/kaz-cold-mist/KazColdMistPath";
import { MarcusSmashRound } from "@/features/minigames/marcus-smash/MarcusSmashRound";
import { PippaSignalScanner } from "@/features/minigames/pippa-signal-scanner/PippaSignalScanner";
import { TalaWildSparkChase } from "@/features/minigames/tala-wild-spark/TalaWildSparkChase";
import type { MiniGameReward } from "@/features/minigames/marcus-smash/types";

type Screen =
  | "loading"
  | "title"
  | "modes"
  | "slot"
  | "marcus-smash"
  | "tala-wild-spark"
  | "pippa-signal-scanner"
  | "kaz-cold-mist";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("modes");
  const [pendingMiniGameReward, setPendingMiniGameReward] = useState<MiniGameReward | null>(null);

  if (screen === "loading") {
    return <LoadingScreen />;
  }

  if (screen === "title") {
    return <TitleScreen onStart={() => setScreen("modes")} />;
  }

  if (screen === "modes") {
    return (
      <ModeSelect
        onPlayKazPrototype={() => setScreen("kaz-cold-mist")}
        onPlayMarcusPrototype={() => setScreen("marcus-smash")}
        onPlayPippaPrototype={() => setScreen("pippa-signal-scanner")}
        onPlayTalaPrototype={() => setScreen("tala-wild-spark")}
        onPlaySlot={() => setScreen("slot")}
      />
    );
  }

  if (screen === "marcus-smash") {
    return (
      <MarcusSmashRound
        onClaimReward={(reward) => {
          setPendingMiniGameReward(reward);
          setScreen("slot");
        }}
        onExit={() => setScreen("modes")}
      />
    );
  }

  if (screen === "tala-wild-spark") {
    return (
      <TalaWildSparkChase
        onClaimReward={(reward) => {
          setPendingMiniGameReward(reward);
          setScreen("slot");
        }}
        onExit={() => setScreen("modes")}
      />
    );
  }

  if (screen === "pippa-signal-scanner") {
    return (
      <PippaSignalScanner
        onClaimReward={(reward) => {
          setPendingMiniGameReward(reward);
          setScreen("slot");
        }}
        onExit={() => setScreen("modes")}
      />
    );
  }

  if (screen === "kaz-cold-mist") {
    return (
      <KazColdMistPath
        onClaimReward={(reward) => {
          setPendingMiniGameReward(reward);
          setScreen("slot");
        }}
        onExit={() => setScreen("modes")}
      />
    );
  }

  return (
    <SlotMachine
      miniGameReward={pendingMiniGameReward}
      onBackToModes={() => setScreen("modes")}
      onMiniGameRewardApplied={() => setPendingMiniGameReward(null)}
    />
  );
}
