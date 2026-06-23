import Image from "next/image";
import type { CSSProperties } from "react";
import type { PlayerCharacter, PlayerCharacterId } from "@/lib/characters";

type FeaturePanelProps = {
  characters: PlayerCharacter[];
  selectedCharacter: PlayerCharacter;
  talaBoostProgress: number;
  onSelectCharacter: (characterId: PlayerCharacterId) => void;
};

export function FeaturePanel({ characters, selectedCharacter, talaBoostProgress, onSelectCharacter }: FeaturePanelProps) {
  const isTala = selectedCharacter.id === "tala";

  return (
    <aside className="slot-side-panel feature-character-panel">
      <div className="feature-panel-label">Character Signal</div>
      <div className="feature-copy" style={{ "--character-glow": selectedCharacter.glowColor } as CSSProperties}>
        <span>{selectedCharacter.ringTitle}</span>
        <strong>{selectedCharacter.displayName}</strong>
        <p>{selectedCharacter.description}</p>
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
      {isTala ? (
        <div className={["tala-boost-card", talaBoostProgress === 2 ? "tala-boost-ready" : ""].join(" ")}>
          <span>Demo Jackpot Boost</span>
          <strong>{talaBoostProgress}/3</strong>
          <p>{talaBoostProgress === 2 ? "Next Tala spin triggers jackpot" : "Paid spins only. Free spins do not count."}</p>
        </div>
      ) : (
        <div className="feature-phase-lock">Locked for Phase 2</div>
      )}
      <p className="character-power-copy">{selectedCharacter.bonusDetail}</p>
      <div className="character-picker" aria-label="Select playable prototype character">
        {characters.map((character) => {
          const selected = character.id === selectedCharacter.id;
          return (
            <button
              aria-pressed={selected}
              className={["character-picker-button", selected ? "selected" : ""].join(" ")}
              key={character.id}
              onClick={() => onSelectCharacter(character.id)}
              style={{ "--character-glow": character.glowColor } as CSSProperties}
              type="button"
            >
              <Image alt={`${character.displayName} portrait`} height={96} src={character.assetPath} width={72} />
              <span>{character.displayName}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
