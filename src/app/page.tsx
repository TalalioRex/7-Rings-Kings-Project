"use client";

import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ModeSelect } from "@/components/ModeSelect";
import { SlotMachine } from "@/components/SlotMachine";
import { TitleScreen } from "@/components/TitleScreen";

type Screen = "loading" | "title" | "modes" | "cursed-reels";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("modes");

  if (screen === "loading") {
    return <LoadingScreen />;
  }

  if (screen === "title") {
    return <TitleScreen onStart={() => setScreen("modes")} />;
  }

  if (screen === "modes") {
    return <ModeSelect onPlayCursedReels={() => setScreen("cursed-reels")} />;
  }

  return <SlotMachine onBackToModes={() => setScreen("modes")} />;
}
