import Image from "next/image";
import type { CSSProperties } from "react";
import { LockedAdventureCard } from "@/components/LockedAdventureCard";
import { getAssetById } from "@/lib/assets";

type ModeSelectProps = {
  onPlayCursedReels: () => void;
};

export function ModeSelect({ onPlayCursedReels }: ModeSelectProps) {
  const logo = getAssetById("official-logo-scene")?.assetPath ?? "/assets/logo/logo-scene.png";
  const introImage = getAssetById("intro-main-team")?.assetPath ?? "/assets/intro/images/intro-01.png";
  const introVideo = getAssetById("intro-main-video")?.assetPath;
  const cursedReelsImage = getAssetById("chuck-vadar")?.assetPath ?? "/assets/slot-symbols/chuck-vadar/symbol.png";

  return (
    <main
      className="mode-select-stage min-h-screen px-4 py-5 sm:px-6 sm:py-8"
      style={{ "--mode-background": `url(${introImage})` } as CSSProperties}
    >
      {introVideo ? (
        <video
          aria-hidden="true"
          autoPlay
          className="mode-background-video"
          loop
          muted
          playsInline
          poster={introImage}
          src={introVideo}
        />
      ) : null}
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl content-center gap-6">
        <header className="mode-select-header">
          <div className="mode-logo-wrap">
            <Image
              alt="7 Rings for 7 Kings logo"
              className="mode-logo"
              height={320}
              priority
              src={logo}
              width={320}
            />
          </div>
          <div className="mode-title-copy">
            <p>Select Mode</p>
            <h1>7 Rings: Aisle 7 Jackpot</h1>
            <span>Fake-money prototype / Phase 1</span>
          </div>
        </header>

        <div className="mode-grid">
          <article className="mode-card mode-card-playable">
            <div className="mode-card-art">
              <Image alt="Chuck Vadar Wild slot symbol" fill sizes="(max-width: 820px) 100vw, 42vw" src={cursedReelsImage} />
            </div>
            <div className="mode-card-topline">
              <div>
                <p>Playable Now</p>
                <h2>Cursed Reels</h2>
              </div>
              <span className="mode-status mode-status-live">Live</span>
            </div>
            <p className="mode-card-copy">
              Classic fake-money reels using the current 7 Rings slot creature assets, Wilds, Scatters, free spins, and demo coin balance.
            </p>
            <div className="mode-feature-row" aria-label="Cursed Reels features">
              <span>5x3 reels</span>
              <span>10 lines</span>
              <span>Local jackpot</span>
            </div>
            <button
              className="mode-primary-button"
              onClick={onPlayCursedReels}
              type="button"
            >
              Play Cursed Reels
            </button>
          </article>

          <LockedAdventureCard />
        </div>
      </section>
    </main>
  );
}
