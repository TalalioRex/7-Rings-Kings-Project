import Image from "next/image";
import { getAssetById } from "@/lib/assets";

export function LockedAdventureCard() {
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
        <span className="mode-status mode-status-locked">Phase 2</span>
      </div>
      <p className="mode-card-copy">
        Story-based cinematic slot adventure mode is locked for Phase 1.
      </p>
      <div className="mode-feature-row mode-feature-row-muted" aria-hidden="true">
        <span>Locked</span>
        <span>Phase 2</span>
        <span>Preview</span>
      </div>
      <button
        className="mode-locked-button"
        disabled
        type="button"
      >
        Locked
      </button>
    </article>
  );
}
