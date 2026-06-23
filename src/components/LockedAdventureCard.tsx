import Image from "next/image";
import { getAssetById } from "@/lib/assets";

type LockedAdventureCardProps = {
  onPlayKazPrototype: () => void;
  onPlayMarcusPrototype: () => void;
  onPlayPippaPrototype: () => void;
  onPlayTalaPrototype: () => void;
};

export function LockedAdventureCard({ onPlayKazPrototype, onPlayMarcusPrototype, onPlayPippaPrototype, onPlayTalaPrototype }: LockedAdventureCardProps) {
  const teaserImage = getAssetById("adventure-teaser-scene")?.assetPath ?? "/assets/scenes/adventure-teaser.png";

  return (
    <article className="mode-card mode-card-locked">
      <div className="mode-card-art mode-card-art-wide">
        <Image alt="Aisle 7 Adventure locked teaser" fill sizes="(max-width: 820px) 100vw, 32vw" src={teaserImage} />
      </div>
      <div className="mode-card-topline">
        <div>
          <p>Locked Preview</p>
          <h2>Aisle 7 Adventure</h2>
        </div>
        <span className="mode-status mode-status-locked">Coming Soon</span>
      </div>
      <p className="mode-card-copy">
        Story-based cinematic adventure mode is still locked. These buttons are contained prototype mini-game tests.
      </p>
      <div className="mode-feature-row mode-feature-row-muted" aria-hidden="true">
        <span>Locked</span>
        <span>Coming Soon</span>
        <span>Preview</span>
      </div>
      <button
        className="mode-locked-button"
        disabled
        type="button"
      >
        Locked
      </button>
      <button className="mode-prototype-button" onClick={onPlayMarcusPrototype} type="button">
        <span>Prototype Mini-Game</span>
        Test Marcus Smash Round
      </button>
      <button className="mode-prototype-button mode-prototype-button-tala" onClick={onPlayTalaPrototype} type="button">
        <span>Prototype Mini-Game</span>
        Play Tala Wild Spark Chase
      </button>
      <button className="mode-prototype-button mode-prototype-button-pippa" onClick={onPlayPippaPrototype} type="button">
        <span>Prototype Mini-Game</span>
        Play Pippa Signal Scanner
      </button>
      <button className="mode-prototype-button mode-prototype-button-kaz" onClick={onPlayKazPrototype} type="button">
        <span>Prototype Mini-Game</span>
        Play Kaz Cold Mist Path
      </button>
    </article>
  );
}
