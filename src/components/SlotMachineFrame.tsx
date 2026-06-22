import type { ReactNode } from "react";
import { PAYLINES } from "@/lib/paylines";
import type { PlayerCharacter } from "@/lib/playerCharacters";
import { FeaturePanel } from "@/components/FeaturePanel";

type SlotMachineFrameProps = {
  balance: number;
  bet: number;
  lastWin: number;
  jackpotMeter: number;
  freeSpinsRemaining: number;
  isFreeSpinMode: boolean;
  selectedCharacter: PlayerCharacter;
  reelWindow: ReactNode;
  resultPanel: ReactNode;
  controls: ReactNode;
};

export function SlotMachineFrame({
  balance,
  bet,
  lastWin,
  jackpotMeter,
  freeSpinsRemaining,
  isFreeSpinMode,
  selectedCharacter,
  reelWindow,
  resultPanel,
  controls
}: SlotMachineFrameProps) {
  return (
    <div className={["premium-slot-shell", isFreeSpinMode ? "free-spin-shell" : ""].join(" ")}>
      <div className="slot-top-plaque">
        <div className="jackpot-marquee" aria-label="Local demo jackpot meter">
          <span>Shrimpie Jackpot</span>
          <strong>{jackpotMeter.toLocaleString()}</strong>
        </div>
        <div className="slot-title-mark">
          <span className="slot-kicker">7 Rings: Aisle 7 Jackpot</span>
          <h1>Cursed Reels</h1>
          <span className="slot-prototype-badge">Fake-money prototype</span>
        </div>
        <div className="slot-bonus-ribbon" aria-label="Free spin awards">
          <RibbonItem label="3 Scatter" value="8 Free Spins" tone="pink" />
          <RibbonItem label="4 Scatter" value="12 Free Spins" tone="cyan" />
          <RibbonItem label="5 Scatter" value="20 Free Spins" tone="green" />
        </div>
      </div>

      <div className="slot-body-grid">
        <aside className="slot-side-panel left-status-panel">
          <PanelMetric label="Credit" value={balance.toLocaleString()} tone="cyan" />
          <PanelMetric label="Bet" value={bet.toLocaleString()} tone="pink" />
          <PanelMetric label="Win" value={lastWin.toLocaleString()} tone="green" />
          <PanelMetric label="Lines" value={String(PAYLINES.length)} tone="cyan" />
          <PanelMetric label="Jackpot" value={jackpotMeter.toLocaleString()} tone="yellow" />
          <PanelMetric label="Free Spins" value={freeSpinsRemaining > 0 ? String(freeSpinsRemaining) : "Off"} tone="yellow" />

          <div className="slot-rule-card wild-rule">
            <span>Wild</span>
            <strong>Chuck Vadar</strong>
            <p>Substitutes for regular symbols.</p>
          </div>
          <div className="slot-rule-card scatter-rule">
            <span>Scatter</span>
            <strong>Aisle 7</strong>
            <p>Three or more trigger free spins.</p>
          </div>
        </aside>

        <section className="slot-reel-frame">
          <div className="reel-frame-cap top" />
          <div className="reel-frame-core">{reelWindow}</div>
          <div className="reel-frame-cap bottom" />
        </section>

        <FeaturePanel selectedCharacter={selectedCharacter} />
      </div>

      <div className="slot-bottom-band">
        <div className="slot-bottom-display">{resultPanel}</div>
        <div className="slot-bottom-controls">{controls}</div>
      </div>
    </div>
  );
}

function RibbonItem({ label, value, tone }: { label: string; value: string; tone: "pink" | "cyan" | "green" }) {
  return (
    <div className={`ribbon-item ribbon-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelMetric({ label, value, tone }: { label: string; value: string; tone: "pink" | "cyan" | "green" | "yellow" }) {
  return (
    <div className={`panel-metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
