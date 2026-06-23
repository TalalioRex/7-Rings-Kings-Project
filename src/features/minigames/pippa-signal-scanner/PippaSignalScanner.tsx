"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetById } from "@/lib/assets";
import {
  playButtonClick,
  playError,
  playMiniGameCombo,
  playMiniGameRewardClaim,
  playMiniGameRoundComplete,
  playMiniGameStart,
  playMiniGameTimerWarning,
  playPippaCorrectSignal,
  playPippaScannerPulse,
  playPippaSpecialDetected,
  playTalaPowerUp
} from "@/lib/audio";
import { STORAGE_KEYS } from "@/lib/gameConfig";
import {
  PIPPA_EMPTY_TARGET,
  PIPPA_SIGNAL_CELL_COUNT,
  PIPPA_SIGNAL_COMBO_WINDOW_MS,
  PIPPA_SIGNAL_DURATION_SECONDS,
  getWeightedPippaNonCursed,
  getWeightedPippaTarget
} from "@/features/minigames/pippa-signal-scanner/pippaSignalConfig";
import { getPippaSignalReward, getPippaSignalResult } from "@/features/minigames/pippa-signal-scanner/pippaSignalRewards";
import type {
  PippaScannerResult,
  PippaScannerReward,
  PippaShelfCell,
  PippaSignalTargetConfig
} from "@/features/minigames/pippa-signal-scanner/types";

type PippaSignalScannerProps = {
  onExit: () => void;
  onClaimReward: (reward: PippaScannerReward) => void;
};

type RoundPhase = "idle" | "running" | "complete";

type FloatingText = {
  id: string;
  index: number;
  text: string;
  tone: "good" | "bad" | "power";
};

const PIPPA_ASSET_PATH = "/assets/characters/pippa.png";
const CHUCK_ASSET_PATH = "/assets/slot-symbols/chuck-vadar/symbol.png";

export function PippaSignalScanner({ onExit, onClaimReward }: PippaSignalScannerProps) {
  const [phase, setPhase] = useState<RoundPhase>("idle");
  const [cells, setCells] = useState<PippaShelfCell[]>(() => createInitialCells(false));
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(PIPPA_SIGNAL_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [interference, setInterference] = useState(0);
  const [neutralizedCount, setNeutralizedCount] = useState(0);
  const [chuckDetected, setChuckDetected] = useState(false);
  const [message, setMessage] = useState("Pippa is reading the prank aisle signal.");
  const [result, setResult] = useState<PippaScannerResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannerIndex, setScannerIndex] = useState<number | null>(null);
  const [revealAllUntil, setRevealAllUntil] = useState(0);
  const [freezeTrapsUntil, setFreezeTrapsUntil] = useState(0);
  const [scannerDisabledUntil, setScannerDisabledUntil] = useState(0);
  const [scrambleUntil, setScrambleUntil] = useState(0);

  const phaseRef = useRef<RoundPhase>("idle");
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const interferenceRef = useRef(0);
  const neutralizedRef = useRef(0);
  const chuckDetectedRef = useRef(false);
  const lastNeutralizeAtRef = useRef(0);
  const roundEndsAtRef = useRef(0);
  const warnedSurgeRef = useRef(false);
  const gameplayBackground = getAssetById("gameplay-background")?.assetPath;

  const currentTime = typeof window === "undefined" ? 0 : performance.now();
  const signalSurge = phase === "running" && remainingSeconds <= 7;
  const scannerDisabled = phase === "running" && currentTime < scannerDisabledUntil;
  const revealAllActive = phase === "running" && currentTime < revealAllUntil;
  const trapsFrozen = phase === "running" && currentTime < freezeTrapsUntil;
  const scrambled = phase === "running" && currentTime < scrambleUntil;
  const rewardPreview = useMemo(
    () => getPippaSignalReward(score, bestCombo, interference, chuckDetected),
    [bestCombo, chuckDetected, interference, score]
  );

  useEffect(() => {
    const storedSound = window.localStorage.getItem(STORAGE_KEYS.sound);
    setSoundEnabled(storedSound === null ? true : storedSound === "true");
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;

    const tickId = window.setInterval(() => {
      const now = performance.now();
      const nextRemaining = Math.max(0, Math.ceil((roundEndsAtRef.current - now) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 7 && !warnedSurgeRef.current) {
        warnedSurgeRef.current = true;
        setMessage("SIGNAL SURGE!");
        playMiniGameTimerWarning(soundEnabled);
        setCells((current) => refreshWave(current, true));
      }

      if (comboRef.current > 0 && now - lastNeutralizeAtRef.current > PIPPA_SIGNAL_COMBO_WINDOW_MS) {
        comboRef.current = 0;
        setCombo(0);
      }

      if (now >= roundEndsAtRef.current) {
        finishRound(false);
      }
    }, 100);

    const instabilityId = window.setInterval(() => {
      if (phaseRef.current !== "running" || trapsFrozen) return;
      const activeTraps = cells.filter((cell) => cell.config.kind === "trap").length;
      if (activeTraps > 0) {
        adjustInterference(signalSurge ? activeTraps * 2 : activeTraps);
      }
    }, 2200);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(instabilityId);
    };
  }, [cells, phase, signalSurge, soundEnabled, trapsFrozen]);

  function startRound() {
    const now = performance.now();
    phaseRef.current = "running";
    scoreRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    interferenceRef.current = 0;
    neutralizedRef.current = 0;
    chuckDetectedRef.current = false;
    lastNeutralizeAtRef.current = now;
    roundEndsAtRef.current = now + PIPPA_SIGNAL_DURATION_SECONDS * 1000;
    warnedSurgeRef.current = false;
    setPhase("running");
    setCells(createInitialCells(false));
    setFloatingTexts([]);
    setRemainingSeconds(PIPPA_SIGNAL_DURATION_SECONDS);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setInterference(0);
    setNeutralizedCount(0);
    setChuckDetected(false);
    setScannerIndex(null);
    setRevealAllUntil(0);
    setFreezeTrapsUntil(0);
    setScannerDisabledUntil(0);
    setScrambleUntil(0);
    setMessage("Scan the shelf. Neutralize only the cursed signal sources.");
    setResult(null);
    playMiniGameStart(soundEnabled);
  }

  function scanCell(index: number) {
    if (phase !== "running" || scannerDisabled) return;
    const now = performance.now();
    setScannerIndex(index);
    setCells((current) =>
      current.map((cell) => (cell.index === index ? { ...cell, revealedUntil: now + 1200 } : cell))
    );
    playPippaScannerPulse(soundEnabled);
  }

  function tapCell(cell: PippaShelfCell) {
    if (phase !== "running" || scannerDisabled) return;
    scanCell(cell.index);

    if (cell.config.kind === "cursed" || cell.config.kind === "special") {
      neutralizeTarget(cell);
      return;
    }

    if (cell.config.kind === "powerup") {
      collectPowerUp(cell);
      return;
    }

    wrongTarget(cell);
  }

  function neutralizeTarget(cell: PippaShelfCell) {
    if (cell.tapsRemaining > 1) {
      setCells((current) =>
        current.map((activeCell) =>
          activeCell.id === cell.id ? { ...activeCell, tapsRemaining: activeCell.tapsRemaining - 1, revealedUntil: performance.now() + 1300 } : activeCell
        )
      );
      setMessage("Special signal locked. One more clean tap.");
      addFloat(cell.index, "LOCK", "power");
      playPippaSpecialDetected(soundEnabled);
      return;
    }

    const now = performance.now();
    const nextCombo = now - lastNeutralizeAtRef.current <= PIPPA_SIGNAL_COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
    const multiplier = getComboMultiplier(nextCombo) * (signalSurge ? 2 : 1);
    const gained = cell.config.points * multiplier;
    const nextBest = Math.max(bestComboRef.current, nextCombo);

    scoreRef.current += gained;
    comboRef.current = nextCombo;
    bestComboRef.current = nextBest;
    neutralizedRef.current += 1;
    lastNeutralizeAtRef.current = now;
    setScore(scoreRef.current);
    setCombo(nextCombo);
    setBestCombo(nextBest);
    setNeutralizedCount(neutralizedRef.current);
    adjustInterference(cell.config.interference);
    addFloat(cell.index, `+${gained}`, cell.config.kind === "special" ? "power" : "good");
    setMessage(cell.config.kind === "special" ? "Chuck Vadar signal detected and contained." : getComboMessage(nextCombo));
    playPippaCorrectSignal(soundEnabled);

    if (cell.config.kind === "special") {
      chuckDetectedRef.current = true;
      setChuckDetected(true);
      playPippaSpecialDetected(soundEnabled);
    } else if (nextCombo === 3 || nextCombo === 6 || nextCombo === 10) {
      playMiniGameCombo(soundEnabled);
    }

    replaceCell(cell.index, true);
  }

  function collectPowerUp(cell: PippaShelfCell) {
    const gained = cell.config.points * (signalSurge ? 2 : 1);
    scoreRef.current += gained;
    setScore(scoreRef.current);
    adjustInterference(cell.config.interference);
    addFloat(cell.index, `+${gained}`, "power");
    setMessage(cell.config.displayName);
    playTalaPowerUp(soundEnabled);

    if (cell.config.effect === "reveal") {
      setRevealAllUntil(performance.now() + 2000);
      setCells((current) => current.map((activeCell) => ({ ...activeCell, revealedUntil: performance.now() + 2000 })));
    } else if (cell.config.effect === "freeze-traps") {
      setFreezeTrapsUntil(performance.now() + 4000);
    } else if (cell.config.effect === "remove-decoy") {
      removeOneDecoy();
    } else if (cell.config.effect === "random-neutralize") {
      neutralizeRandomCursed();
      setScrambleUntil(performance.now() + 1400);
      setScannerDisabledUntil(performance.now() + 650);
    } else if (cell.config.effect === "stabilize") {
      adjustInterference(-25);
    }

    replaceCell(cell.index, true);
  }

  function wrongTarget(cell: PippaShelfCell) {
    const penalty = signalSurge ? Math.ceil(cell.config.interference * 1.4) : cell.config.interference;
    scoreRef.current = Math.max(0, scoreRef.current + cell.config.points);
    comboRef.current = 0;
    setScore(scoreRef.current);
    setCombo(0);
    adjustInterference(penalty);
    addFloat(cell.index, cell.config.kind === "trap" ? "STATIC!" : "WRONG", "bad");
    setMessage(cell.config.kind === "trap" ? "Scanner unstable." : "Pippa is not amused.");
    if (cell.config.kind === "trap") {
      setScannerDisabledUntil(performance.now() + 950);
    }
    playError(soundEnabled);
    replaceCell(cell.index, false);
  }

  function replaceCell(index: number, preferCursed: boolean) {
    setCells((current) =>
      current.map((cell) =>
        cell.index === index ? createCell(index, preferCursed ? Math.random() > 0.28 : Math.random() > 0.5, signalSurge) : cell
      )
    );
  }

  function removeOneDecoy() {
    setCells((current) => {
      const decoy = current.find((cell) => cell.config.kind === "decoy");
      if (!decoy) return current;
      addFloat(decoy.index, "FILTER", "power");
      return current.map((cell) => (cell.id === decoy.id ? createCell(cell.index, true, signalSurge) : cell));
    });
  }

  function neutralizeRandomCursed() {
    const target = cells.find((cell) => cell.config.kind === "cursed");
    if (!target) return;
    scoreRef.current += 100;
    neutralizedRef.current += 1;
    setScore(scoreRef.current);
    setNeutralizedCount(neutralizedRef.current);
    addFloat(target.index, "GLITCH +100", "power");
    replaceCell(target.index, true);
  }

  function adjustInterference(amount: number) {
    const nextInterference = Math.max(0, Math.min(100, interferenceRef.current + amount));
    interferenceRef.current = nextInterference;
    setInterference(nextInterference);
    if (amount > 0 && nextInterference >= 70) {
      setMessage("Signal interference rising.");
      playMiniGameTimerWarning(soundEnabled);
    }
    if (nextInterference >= 100) {
      window.setTimeout(() => finishRound(true), 0);
    }
  }

  function finishRound(endedByInterference: boolean) {
    if (phaseRef.current === "complete") return;
    phaseRef.current = "complete";
    const roundResult = getPippaSignalResult(
      scoreRef.current,
      bestComboRef.current,
      interferenceRef.current,
      neutralizedRef.current,
      chuckDetectedRef.current,
      endedByInterference
    );
    setResult(roundResult);
    setPhase("complete");
    setRemainingSeconds(0);
    setScannerIndex(null);
    setFloatingTexts([]);
    setMessage(roundResult.flavorText);
    playMiniGameRoundComplete(soundEnabled);
  }

  function claimReward() {
    if (!result) return;
    playMiniGameRewardClaim(soundEnabled);
    onClaimReward(result.reward);
  }

  function replayRound() {
    playButtonClick(soundEnabled);
    startRound();
  }

  function addFloat(index: number, text: string, tone: FloatingText["tone"]) {
    const id = `pippa-float-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setFloatingTexts((current) => [...current, { id, index, text, tone }]);
    window.setTimeout(() => {
      setFloatingTexts((current) => current.filter((item) => item.id !== id));
    }, 740);
  }

  return (
    <main
      className="pippa-signal-stage min-h-screen px-3 py-3 sm:px-5"
      style={gameplayBackground ? ({ "--gameplay-background": `url(${gameplayBackground})` } as CSSProperties) : undefined}
    >
      <section className="pippa-signal-shell mx-auto max-w-7xl">
        <header className="pippa-signal-header">
          <button className="mode-back-button" onClick={onExit} type="button">
            Back
          </button>
          <div>
            <p>Prototype Mini-Game / Aisle 7 Adventure remains Coming Soon</p>
            <h1>Pippa Signal Scanner</h1>
            <span>Prank Aisle Lockdown / Find the cursed signal</span>
          </div>
          <div className="marcus-smash-notice">Demo coins only / no real-money systems</div>
        </header>

        <div className="pippa-signal-grid">
          <aside className="pippa-hero-panel">
            <div className="pippa-hero-copy">
              <span>Ring of Signal</span>
              <strong>{message}</strong>
            </div>
            <div className="pippa-hero-art">
              <Image alt="Pippa character art" height={720} priority src={PIPPA_ASSET_PATH} width={480} />
              <div className="pippa-signal-wave" />
            </div>
            <p>Detect cursed prank objects. Do not tap normal shelf junk unless you enjoy interference.</p>
          </aside>

          <section className={["pippa-scanner-card", signalSurge ? "pippa-surge-card" : "", scrambled ? "pippa-scramble-card" : ""].join(" ")}>
            <div className="pippa-hud">
              <HudMetric label="Timer" value={`${remainingSeconds}s`} danger={remainingSeconds <= 7 && phase === "running"} />
              <HudMetric label="Score" value={score.toLocaleString()} />
              <HudMetric label="Combo" value={combo ? `x${getComboMultiplier(combo)}` : "x1"} />
              <HudMetric label="Neutralized" value={String(neutralizedCount)} />
              <div className="pippa-interference">
                <span>Interference</span>
                <strong>{interference}%</strong>
                <div><i style={{ width: `${interference}%` }} /></div>
              </div>
            </div>

            <div className="pippa-board-shell">
              <div className="pippa-shelf-grid" aria-label="4x3 cursed prank shelf">
                {cells.map((cell) => {
                  const revealed = phase === "running" && (revealAllActive || cell.revealedUntil > currentTime || scannerIndex === cell.index);
                  const isScanner = scannerIndex === cell.index;
                  const floats = floatingTexts.filter((float) => float.index === cell.index);
                  return (
                    <button
                      aria-label={revealed ? cell.config.displayName : `Shelf compartment ${cell.index + 1}`}
                      className={[
                        "pippa-shelf-cell",
                        revealed ? `revealed signal-${cell.config.kind}` : "",
                        isScanner ? "scanner-active" : "",
                        trapsFrozen && cell.config.kind === "trap" ? "trap-frozen" : ""
                      ].join(" ")}
                      disabled={phase !== "running" || scannerDisabled}
                      key={cell.id}
                      onClick={() => tapCell(cell)}
                      onPointerEnter={() => scanCell(cell.index)}
                      onPointerMove={(event: PointerEvent<HTMLButtonElement>) => {
                        if (event.pointerType !== "mouse") scanCell(cell.index);
                      }}
                      style={{ "--signal-color": cell.config.color } as CSSProperties}
                      type="button"
                    >
                      <span className="pippa-cell-hole" />
                      {revealed ? (
                        <span className="pippa-signal-tile">
                          {cell.config.kind === "special" ? (
                            <Image alt="Chuck Vadar signal" height={70} src={CHUCK_ASSET_PATH} width={70} />
                          ) : (
                            <strong>{cell.config.glyph}</strong>
                          )}
                          <em>{cell.config.displayName}</em>
                          {cell.tapsRemaining > 1 ? <small>{cell.tapsRemaining} locks</small> : null}
                        </span>
                      ) : (
                        <span className="pippa-hidden-item">?</span>
                      )}
                      {isScanner ? <span className="pippa-scan-ring" /> : null}
                      {floats.map((float) => (
                        <span className={`pippa-score-float float-${float.tone}`} key={float.id}>
                          {float.text}
                        </span>
                      ))}
                    </button>
                  );
                })}
                {phase === "idle" ? (
                  <div className="pippa-attract-overlay">
                    <strong>Scan Ready</strong>
                    <p>Hover or tap shelf slots to reveal signal color. Neutralize cursed targets. Avoid decoys and traps.</p>
                  </div>
                ) : null}
                {scannerDisabled ? <div className="pippa-disabled-overlay">Scanner recalibrating</div> : null}
              </div>
            </div>

            <div className="marcus-arena-actions">
              <button className="marcus-primary-button" disabled={phase === "running"} onClick={phase === "complete" ? replayRound : startRound} type="button">
                {phase === "running" ? "Scanning" : phase === "complete" ? "Play Again" : "Start Scan"}
              </button>
              <p>{signalSurge ? "SIGNAL SURGE!" : "Hover/tap to scan. Tap only cursed signals and power-ups."}</p>
            </div>
          </section>

          <aside className="marcus-reward-panel">
            <span>Reward Preview</span>
            <RewardRow label="0-499 points" value="250 coins" />
            <RewardRow label="500-999 points" value="500 coins" />
            <RewardRow label="1000-1499 points" value="750 coins + 1 free spin" />
            <RewardRow label="1500-2499 points" value="1000 coins + 3 free spins" />
            <RewardRow label="2500-3499 points" value="1500 coins + 5 free spins" />
            <RewardRow label="3500+ points" value="2000 coins + 5 free spins + 2x next paid spin" />
            <RewardRow label="Bonuses" value="+250 coins below 25% interference. +1 free spin for Chuck or 10+ combo." />
            <RewardRow
              label="Current projection"
              value={`${rewardPreview.coins.toLocaleString()} coins, ${rewardPreview.freeSpins} free spins${rewardPreview.nextSpinMultiplier ? `, ${rewardPreview.nextSpinMultiplier}x next paid spin` : ""}`}
            />
          </aside>
        </div>
      </section>

      {phase === "complete" && result ? (
        <section className="marcus-end-screen" role="dialog" aria-modal="true" aria-labelledby="pippa-result-title">
          <div className="pippa-end-card">
            <Image alt="Pippa result art" height={420} src={PIPPA_ASSET_PATH} width={280} />
            <div>
              <p>{result.flavorText}</p>
              <h2 id="pippa-result-title">Signal Report</h2>
              <div className="marcus-result-stats">
                <span>Score: {result.score.toLocaleString()}</span>
                <span>Best Combo: {result.bestCombo}</span>
                <span>Interference: {result.finalInterference}%</span>
                <span>Neutralized: {result.neutralizedCount}</span>
                <span>Chuck Vadar: {result.chuckDetected ? "Detected" : "Not detected"}</span>
              </div>
              <div className="marcus-reward-list">
                <span>{result.reward.coins.toLocaleString()} demo coins</span>
                <span>{result.reward.freeSpins} free spins</span>
                {result.reward.nextSpinMultiplier ? <span>{result.reward.nextSpinMultiplier}x next paid spin</span> : null}
              </div>
              <div className="marcus-end-actions">
                <button className="marcus-primary-button" onClick={claimReward} type="button">
                  Claim Reward
                </button>
                <button className="mode-back-button" onClick={replayRound} type="button">
                  Play Again
                </button>
                <button className="mode-back-button" onClick={onExit} type="button">
                  Back to Modes
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function createInitialCells(signalSurge: boolean): PippaShelfCell[] {
  return Array.from({ length: PIPPA_SIGNAL_CELL_COUNT }, (_, index) => createCell(index, index % 3 === 0, signalSurge));
}

function refreshWave(current: PippaShelfCell[], signalSurge: boolean) {
  return current.map((cell) => (Math.random() > 0.46 ? createCell(cell.index, true, signalSurge) : cell));
}

function createCell(index: number, preferCursed: boolean, signalSurge: boolean): PippaShelfCell {
  const config = preferCursed ? getWeightedPippaTarget(signalSurge) : getWeightedPippaNonCursed(signalSurge);
  return {
    id: `pippa-cell-${index}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    index,
    config,
    tapsRemaining: config.requiredTaps ?? 1,
    revealedUntil: 0
  };
}

function HudMetric({ danger = false, label, value }: { danger?: boolean; label: string; value: string }) {
  return (
    <div className={["marcus-hud-metric", danger ? "hud-danger" : ""].join(" ")}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RewardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="marcus-reward-row">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function getComboMultiplier(comboValue: number) {
  if (comboValue >= 10) return 5;
  if (comboValue >= 6) return 3;
  if (comboValue >= 3) return 2;
  return 1;
}

function getComboMessage(comboValue: number) {
  if (comboValue >= 10) return "SIGNAL LOCKDOWN!";
  if (comboValue >= 6) return "PIPPA PRECISION!";
  if (comboValue >= 3) return "SIGNAL CHAIN!";
  return "Signal neutralized.";
}
