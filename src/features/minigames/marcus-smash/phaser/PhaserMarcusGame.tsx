"use client";

import { useEffect, useRef, useState } from "react";
import { createMarcusSmashScene, type MarcusSmashSceneOptions } from "@/features/minigames/marcus-smash/phaser/MarcusSmashScene";

type PhaserMarcusGameProps = MarcusSmashSceneOptions & {
  roundToken: number;
};

export function PhaserMarcusGame({ onComplete, onHudUpdate, onSound, roundToken }: PhaserMarcusGameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let game: import("phaser").Game | null = null;
    let disposed = false;

    async function bootGame() {
      try {
        if (!hostRef.current) return;
        setBootError(null);
        const phaserImport = await import("phaser");
        const Phaser = (phaserImport.default ?? phaserImport) as typeof import("phaser");
        if (disposed || !hostRef.current) return;

        const SceneClass = createMarcusSmashScene(Phaser, { onComplete, onHudUpdate, onSound });
        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: hostRef.current,
          width: 900,
          height: 620,
          backgroundColor: "#03050e",
          scene: [SceneClass],
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 900,
            height: 620
          },
          input: {
            activePointers: 3
          }
        });
      } catch (error) {
        setBootError(error instanceof Error ? error.message : "Phaser failed to start.");
      }
    }

    void bootGame();

    return () => {
      disposed = true;
      game?.destroy(true);
      game = null;
      if (hostRef.current) {
        hostRef.current.replaceChildren();
      }
    };
  }, [onComplete, onHudUpdate, onSound, roundToken]);

  return (
    <div className="phaser-marcus-game" ref={hostRef}>
      {bootError ? (
        <div className="phaser-boot-error">
          <strong>Mini-game failed to start</strong>
          <span>{bootError}</span>
        </div>
      ) : null}
    </div>
  );
}
