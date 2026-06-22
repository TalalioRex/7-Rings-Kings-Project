import Image from "next/image";
import type { CSSProperties } from "react";
import type { PlayerCharacter } from "@/lib/playerCharacters";

type FeaturePanelProps = {
  selectedCharacter: PlayerCharacter;
};

export function FeaturePanel({ selectedCharacter }: FeaturePanelProps) {
  return (
    <aside className="slot-side-panel feature-character-panel">
      <div className="feature-panel-label">Prototype Feature Teaser</div>
      <div className="feature-copy" style={{ "--character-glow": selectedCharacter.glowColor } as CSSProperties}>
        <span>Future Feature Preview</span>
        <strong>{selectedCharacter.displayName}</strong>
        <p>{selectedCharacter.bonusSummary}</p>
        <div className="character-bonus-chip">{selectedCharacter.bonusTitle}</div>
      </div>
      <div className="feature-character-art">
        <Image
          alt={`${selectedCharacter.displayName} featured slot character`}
          height={720}
          src={selectedCharacter.assetPath}
          width={480}
          className="feature-character-image"
        />
      </div>
      <div className="feature-phase-lock">
        Locked for Phase 2
      </div>
      <p className="character-power-copy">{selectedCharacter.bonusDetail}</p>
    </aside>
  );
}
