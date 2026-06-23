"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetById } from "@/lib/assets";
import {
  playButtonClick,
  playError,
  playKazHit,
  playKazMistWave,
  playKazOrbPickup,
  playKazSilentSlash,
  playKazStep,
  playMiniGameCombo,
  playMiniGameRewardClaim,
  playMiniGameRoundComplete,
  playMiniGameStart,
  playMiniGameTimerWarning,
  playTalaPowerUp
} from "@/lib/audio";
import { STORAGE_KEYS } from "@/lib/gameConfig";
import {
  KAZ_COLD_MIST_COLUMNS,
  KAZ_COLD_MIST_COMBO_WINDOW_MS,
  KAZ_COLD_MIST_DURATION_SECONDS,
  KAZ_COLD_MIST_HEALTH,
  KAZ_COLD_MIST_ROWS,
  KAZ_COLD_MIST_START_STEALTH,
  KAZ_COLLECTIBLE_POINTS,
  KAZ_POWERUP_LABELS,
  KAZ_SPIRIT_LABELS,
  createKazBoard,
  getTileDistanceScore
} from "@/features/minigames/kaz-cold-mist/kazColdMistConfig";
import { getKazColdMistResult, getKazColdMistReward } from "@/features/minigames/kaz-cold-mist/kazColdMistRewards";
import type { KazCell, KazColdMistResult, KazColdMistReward, KazPosition } from "@/features/minigames/kaz-cold-mist/types";

type KazColdMistPathProps = {
  onExit: () => void;
  onClaimReward: (reward: KazColdMistReward) => void;
};

type RoundPhase = "idle" | "running" | "complete";

type FloatingText = {
  id: string;
  index: number;
  text: string;
  tone: "good" | "bad" | "power";
};

const KAZ_ASSET_PATH = "/assets/characters/kaz.png";
const START_POSITION: KazPosition = { row: 0, column: 0 };

export function KazColdMistPath({ onExit, onClaimReward }: KazColdMistPathProps) {
  const [phase, setPhase] = useState<RoundPhase>("idle");
  const [board, setBoard] = useState<KazCell[]>(() => createKazBoard());
  const [kazPosition, setKazPosition] = useState<KazPosition>(START_POSITION);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(KAZ_COLD_MIST_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [hearts, setHearts] = useState(KAZ_COLD_MIST_HEALTH);
  const [stealth, setStealth] = useState(KAZ_COLD_MIST_START_STEALTH);
  const [distanceReached, setDistanceReached] = useState(0);
  const [exitReached, setExitReached] = useState(false);
  const [message, setMessage] = useState("Kaz is waiting for the mist pattern.");
  const [result, setResult] = useState<KazColdMistResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hitPulse, setHitPulse] = useState(0);
  const [silenceFieldUntil, setSilenceFieldUntil] = useState(0);
  const [cyanSlashReady, setCyanSlashReady] = useState(false);
  const [visionUntil, setVisionUntil] = useState(0);
  const [signalLockUntil, setSignalLockUntil] = useState(0);
  const [shieldHits, setShieldHits] = useState(0);

  const phaseRef = useRef<RoundPhase>("idle");
  const positionRef = useRef<KazPosition>(START_POSITION);
  const boardRef = useRef<KazCell[]>(createKazBoard());
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const heartsRef = useRef(KAZ_COLD_MIST_HEALTH);
  const stealthRef = useRef(KAZ_COLD_MIST_START_STEALTH);
  const distanceRef = useRef(0);
  const exitReachedRef = useRef(false);
  const lastActionAtRef = useRef(0);
  const roundEndsAtRef = useRef(0);
  const mistWaveColumnRef = useRef(-1);
  const warnedSurgeRef = useRef(false);
  const gameplayBackground = getAssetById("gameplay-background")?.assetPath;

  const now = typeof window === "undefined" ? 0 : performance.now();
  const coldSurge = phase === "running" && remainingSeconds <= 7;
  const silenceFieldActive = phase === "running" && now < silenceFieldUntil;
  const visionActive = phase === "running" && now < visionUntil;
  const signalLockActive = phase === "running" && now < signalLockUntil;
  const rewardPreview = useMemo(() => getKazColdMistReward(score, exitReached, hearts, stealth), [exitReached, hearts, score, stealth]);

  useEffect(() => {
    const storedSound = window.localStorage.getItem(STORAGE_KEYS.sound);
    setSoundEnabled(storedSound === null ? true : storedSound === "true");
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    positionRef.current = kazPosition;
  }, [kazPosition]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (phaseRef.current !== "running") return;
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        moveKaz(-1, 0);
      } else if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        moveKaz(1, 0);
      } else if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        moveKaz(0, -1);
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault();
        moveKaz(0, 1);
      } else if (key === " ") {
        event.preventDefault();
        silentSlash();
      } else if (key === "shift") {
        event.preventDefault();
        silenceStep();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [soundEnabled, cyanSlashReady]);

  useEffect(() => {
    if (phase !== "running") return;

    const tickId = window.setInterval(() => {
      const currentTime = performance.now();
      const nextRemaining = Math.max(0, Math.ceil((roundEndsAtRef.current - currentTime) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 7 && !warnedSurgeRef.current) {
        warnedSurgeRef.current = true;
        setMessage("COLD SURGE.");
        pulseSafeTiles(1600);
        playMiniGameTimerWarning(soundEnabled);
      }

      if (comboRef.current > 0 && currentTime - lastActionAtRef.current > KAZ_COLD_MIST_COMBO_WINDOW_MS) {
        comboRef.current = 0;
        setCombo(0);
      }

      if (currentTime >= roundEndsAtRef.current) {
        finishRound(false);
      }
    }, 100);

    const mistId = window.setInterval(() => {
      launchMistWave();
    }, silenceFieldActive ? 1500 : coldSurge ? 650 : 950);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(mistId);
    };
  }, [coldSurge, phase, silenceFieldActive, soundEnabled]);

  function startRound() {
    const freshBoard = createKazBoard();
    const startTime = performance.now();
    phaseRef.current = "running";
    boardRef.current = freshBoard;
    positionRef.current = START_POSITION;
    scoreRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    heartsRef.current = KAZ_COLD_MIST_HEALTH;
    stealthRef.current = KAZ_COLD_MIST_START_STEALTH;
    distanceRef.current = 0;
    exitReachedRef.current = false;
    lastActionAtRef.current = startTime;
    roundEndsAtRef.current = startTime + KAZ_COLD_MIST_DURATION_SECONDS * 1000;
    mistWaveColumnRef.current = -1;
    warnedSurgeRef.current = false;
    setPhase("running");
    setBoard(freshBoard);
    setKazPosition(START_POSITION);
    setFloatingTexts([]);
    setRemainingSeconds(KAZ_COLD_MIST_DURATION_SECONDS);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setHearts(KAZ_COLD_MIST_HEALTH);
    setStealth(KAZ_COLD_MIST_START_STEALTH);
    setDistanceReached(0);
    setExitReached(false);
    setMessage("Move tile by tile. Watch the mist. Slash only when needed.");
    setResult(null);
    setSilenceFieldUntil(0);
    setCyanSlashReady(false);
    setVisionUntil(0);
    setSignalLockUntil(0);
    setShieldHits(0);
    playMiniGameStart(soundEnabled);
    window.setTimeout(() => pulseSafeTiles(1300), 250);
  }

  function moveKaz(rowDelta: number, columnDelta: number) {
    const current = positionRef.current;
    const nextPosition = {
      row: Math.max(0, Math.min(KAZ_COLD_MIST_ROWS - 1, current.row + rowDelta)),
      column: Math.max(0, Math.min(KAZ_COLD_MIST_COLUMNS - 1, current.column + columnDelta))
    };
    if (nextPosition.row === current.row && nextPosition.column === current.column) return;

    const nextCell = getCell(nextPosition.row, nextPosition.column);
    if (!nextCell || nextCell.kind === "blocked") {
      setMessage("Shelf shadow blocks the path.");
      adjustStealth(-6);
      playError(soundEnabled);
      return;
    }

    positionRef.current = nextPosition;
    setKazPosition(nextPosition);
    playKazStep(soundEnabled);
    successfulAction(20, nextCell.index, "STEP", "good");
    distanceRef.current = Math.max(distanceRef.current, getTileDistanceScore(nextPosition.row, nextPosition.column));
    setDistanceReached(distanceRef.current);
    resolveCellEntry(nextCell);
  }

  function resolveCellEntry(cell: KazCell) {
    if (cell.mistActive || cell.kind === "cursed" || cell.kind === "false-safe") {
      takeDamage(cell.index, cell.mistActive ? "Mist wave found Kaz." : "Cursed tile disturbed the silence.");
      return;
    }

    if (cell.kind === "checkpoint") {
      successfulAction(200, cell.index, "+200 CHECKPOINT", "power");
      adjustStealth(10);
      setMessage("Checkpoint crossed without noise.");
    }

    if (cell.kind === "exit") {
      successfulAction(500, cell.index, "+500 EXIT", "power");
      exitReachedRef.current = true;
      setExitReached(true);
      setMessage("Kaz reached the exit in silence.");
      window.setTimeout(() => finishRound(false), 250);
      return;
    }

    if (cell.collectible) {
      const points = KAZ_COLLECTIBLE_POINTS[cell.collectible];
      if (points > 0) {
        successfulAction(points, cell.index, `+${points}`, "good");
      }
      if (cell.collectible === "mist-pearl") {
        adjustStealth(15);
        setMessage("Mist Pearl restored stealth.");
      } else if (cell.collectible === "shield-seal") {
        setShieldHits((current) => current + 1);
        setMessage("Shield Seal armed.");
        playTalaPowerUp(soundEnabled);
      } else {
        setMessage(cell.collectible === "ring-echo" ? "Ring Echo collected." : "Silent Strength Orb collected.");
        playKazOrbPickup(soundEnabled);
      }
      clearCellPickup(cell.index);
    }

    if (cell.powerUp) {
      activatePowerUp(cell);
      clearCellPickup(cell.index);
    }
  }

  function silentSlash() {
    const currentCell = getCell(positionRef.current.row, positionRef.current.column);
    if (!currentCell) return;
    const nearbySpirits = boardRef.current.filter((cell) => cell.spirit && Math.abs(cell.row - currentCell.row) + Math.abs(cell.column - currentCell.column) <= (cyanSlashReady ? 2 : 1));

    if (!nearbySpirits.length) {
      scoreRef.current = Math.max(0, scoreRef.current - 50);
      comboRef.current = 0;
      setScore(scoreRef.current);
      setCombo(0);
      adjustStealth(-10);
      addFloat(currentCell.index, "-50", "bad");
      setMessage("Wrong slash. The silence noticed.");
      playError(soundEnabled);
      return;
    }

    const slashTargets = cyanSlashReady ? nearbySpirits : [nearbySpirits[0]];
    slashTargets.forEach((target) => {
      successfulAction(150, target.index, "+150 SLASH", "power");
    });
    setBoard((current) =>
      current.map((cell) =>
        slashTargets.some((target) => target.index === cell.index)
          ? { ...cell, spirit: undefined, kind: cell.kind === "cursed" ? "safe" : cell.kind }
          : cell
      )
    );
    setCyanSlashReady(false);
    adjustStealth(6);
    setMessage(cyanSlashReady ? "Cyan Slash cleared the spirits." : "Silent Slash landed.");
    playKazSilentSlash(soundEnabled);
  }

  function silenceStep() {
    if (shieldHits > 0) {
      setShieldHits((current) => Math.max(0, current - 1));
      adjustStealth(8);
      setMessage("Silence Step absorbed the next mistake.");
      playTalaPowerUp(soundEnabled);
      return;
    }

    adjustStealth(-8);
    setMessage("Silence Step needs a shield seal.");
    playError(soundEnabled);
  }

  function activatePowerUp(cell: KazCell) {
    if (!cell.powerUp) return;
    successfulAction(100, cell.index, "+100", "power");
    if (cell.powerUp === "silence-field") {
      setSilenceFieldUntil(performance.now() + 4000);
    } else if (cell.powerUp === "cyan-slash") {
      setCyanSlashReady(true);
    } else if (cell.powerUp === "jason-vision-ping") {
      setVisionUntil(performance.now() + 2400);
      pulseSafeTiles(2400);
    } else if (cell.powerUp === "pippa-signal-lock") {
      setSignalLockUntil(performance.now() + 4000);
    } else if (cell.powerUp === "heartstorm-guard") {
      setShieldHits((current) => current + 1);
    }
    setMessage(KAZ_POWERUP_LABELS[cell.powerUp]);
    playTalaPowerUp(soundEnabled);
  }

  function launchMistWave() {
    if (phaseRef.current !== "running") return;
    mistWaveColumnRef.current = (mistWaveColumnRef.current + 1) % KAZ_COLD_MIST_COLUMNS;
    const activeColumn = mistWaveColumnRef.current;
    const now = performance.now();
    setBoard((current) => {
      const next = current.map((cell) => ({
        ...cell,
        mistActive: cell.column === activeColumn,
        safeGlowUntil: cell.kind === "safe" || cell.kind === "checkpoint" || cell.kind === "exit" ? now + (coldSurge ? 550 : 850) : cell.safeGlowUntil
      }));
      boardRef.current = next;
      return next;
    });
    playKazMistWave(soundEnabled);

    const position = positionRef.current;
    if (position.column === activeColumn) {
      const activeCell = getCell(position.row, position.column);
      window.setTimeout(() => {
        if (phaseRef.current === "running" && positionRef.current.column === activeColumn) {
          takeDamage(activeCell?.index ?? 0, "Mist wave crossed Kaz.");
        }
      }, 80);
    }
  }

  function pulseSafeTiles(durationMs: number) {
    const until = performance.now() + durationMs;
    setBoard((current) =>
      current.map((cell) => ({
        ...cell,
        safeGlowUntil: cell.kind === "safe" || cell.kind === "checkpoint" || cell.kind === "exit" ? until : cell.safeGlowUntil
      }))
    );
  }

  function successfulAction(basePoints: number, index: number, label: string, tone: FloatingText["tone"]) {
    const now = performance.now();
    const nextCombo = now - lastActionAtRef.current <= KAZ_COLD_MIST_COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
    const multiplier = getComboMultiplier(nextCombo) * (coldSurge ? 2 : 1) * (stealthRef.current <= 0 ? 0.5 : 1);
    const gained = Math.round(basePoints * multiplier);
    const nextBest = Math.max(bestComboRef.current, nextCombo);
    scoreRef.current += gained;
    comboRef.current = nextCombo;
    bestComboRef.current = nextBest;
    lastActionAtRef.current = now;
    setScore(scoreRef.current);
    setCombo(nextCombo);
    setBestCombo(nextBest);
    addFloat(index, multiplier > 1 ? `${label} x${multiplier}` : label, tone);
    if (nextCombo === 3 || nextCombo === 6 || nextCombo === 10) {
      playMiniGameCombo(soundEnabled);
    }
  }

  function takeDamage(index: number, text: string) {
    if (shieldHits > 0) {
      setShieldHits((current) => Math.max(0, current - 1));
      addFloat(index, "SHIELD", "power");
      setMessage("Heartstorm Guard absorbed the mist.");
      playTalaPowerUp(soundEnabled);
      return;
    }

    const nextHearts = Math.max(0, heartsRef.current - 1);
    heartsRef.current = nextHearts;
    comboRef.current = 0;
    scoreRef.current = Math.max(0, scoreRef.current - 100);
    setHearts(nextHearts);
    setCombo(0);
    setScore(scoreRef.current);
    adjustStealth(-22);
    addFloat(index, "HIT!", "bad");
    setHitPulse((current) => current + 1);
    setMessage(text);
    playKazHit(soundEnabled);
    if (nextHearts <= 0) {
      window.setTimeout(() => finishRound(true), 0);
    }
  }

  function adjustStealth(amount: number) {
    const nextStealth = Math.max(0, Math.min(100, stealthRef.current + amount));
    stealthRef.current = nextStealth;
    setStealth(nextStealth);
  }

  function clearCellPickup(index: number) {
    setBoard((current) => {
      const next = current.map((cell) => (cell.index === index ? { ...cell, collectible: undefined, powerUp: undefined } : cell));
      boardRef.current = next;
      return next;
    });
  }

  function getCell(row: number, column: number) {
    return boardRef.current.find((cell) => cell.row === row && cell.column === column);
  }

  function finishRound(endedByHealth: boolean) {
    if (phaseRef.current === "complete") return;
    phaseRef.current = "complete";
    const roundResult = getKazColdMistResult(
      scoreRef.current,
      bestComboRef.current,
      heartsRef.current,
      stealthRef.current,
      distanceRef.current,
      exitReachedRef.current,
      endedByHealth
    );
    setResult(roundResult);
    setPhase("complete");
    setRemainingSeconds(0);
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
    const id = `kaz-float-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setFloatingTexts((current) => [...current, { id, index, text, tone }]);
    window.setTimeout(() => {
      setFloatingTexts((current) => current.filter((item) => item.id !== id));
    }, 720);
  }

  function moveFromTouch(event: PointerEvent<HTMLDivElement>) {
    if (phase !== "running") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const column = Math.max(0, Math.min(KAZ_COLD_MIST_COLUMNS - 1, Math.floor((x / rect.width) * KAZ_COLD_MIST_COLUMNS)));
    const row = Math.max(0, Math.min(KAZ_COLD_MIST_ROWS - 1, Math.floor((y / rect.height) * KAZ_COLD_MIST_ROWS)));
    const current = positionRef.current;
    const rowDelta = Math.sign(row - current.row);
    const columnDelta = Math.sign(column - current.column);
    if (Math.abs(row - current.row) >= Math.abs(column - current.column)) {
      moveKaz(rowDelta, 0);
    } else {
      moveKaz(0, columnDelta);
    }
  }

  return (
    <main
      className="kaz-mist-stage min-h-screen px-3 py-3 sm:px-5"
      style={gameplayBackground ? ({ "--gameplay-background": `url(${gameplayBackground})` } as CSSProperties) : undefined}
    >
      <section className="kaz-mist-shell mx-auto max-w-7xl">
        <header className="kaz-mist-header">
          <button className="mode-back-button" onClick={onExit} type="button">
            Back
          </button>
          <div>
            <p>Prototype Mini-Game / Aisle 7 Adventure remains Coming Soon</p>
            <h1>Kaz Silent Strength</h1>
            <span>Cold Mist Path / Move quietly through the sushi aisle</span>
          </div>
          <div className="marcus-smash-notice">Demo coins only / no real-money systems</div>
        </header>

        <div className="kaz-mist-grid">
          <aside className={["kaz-hero-panel", hitPulse ? "kaz-hit-flash" : ""].join(" ")} key={hitPulse}>
            <div className="kaz-hero-copy">
              <span>Ring of Silent Strength</span>
              <strong>{message}</strong>
            </div>
            <div className="kaz-hero-art">
              <Image alt="Kaz character art" height={720} priority src={KAZ_ASSET_PATH} width={480} />
              <div className="kaz-cold-wave" />
            </div>
            <p>Wait for mist patterns. Move only when the path is quiet.</p>
          </aside>

          <section className={["kaz-arena-card", coldSurge ? "kaz-cold-surge-card" : "", silenceFieldActive ? "kaz-silence-field-card" : ""].join(" ")}>
            <div className="kaz-hud">
              <HudMetric label="Timer" value={`${remainingSeconds}s`} danger={remainingSeconds <= 7 && phase === "running"} />
              <HudMetric label="Score" value={score.toLocaleString()} />
              <HudMetric label="Combo" value={combo ? `x${getComboMultiplier(combo)}` : "x1"} />
              <HudMetric label="Distance" value={`${Math.round((distanceReached / (KAZ_COLD_MIST_ROWS * KAZ_COLD_MIST_COLUMNS - 1)) * 100)}%`} />
              <div className="kaz-hearts" aria-label={`${hearts} health remaining`}>
                {Array.from({ length: 3 }, (_, index) => (
                  <span className={index < hearts ? "heart-live" : "heart-lost"} key={index}>HEART</span>
                ))}
              </div>
              <div className="kaz-stealth-meter">
                <span>Stealth</span>
                <strong>{stealth}%</strong>
                <div><i style={{ width: `${stealth}%` }} /></div>
              </div>
            </div>

            <div className="kaz-board-shell" onPointerDown={moveFromTouch}>
              <div className="kaz-mist-board" aria-label="Kaz cold mist grid path">
                {board.map((cell) => {
                  const isKaz = kazPosition.row === cell.row && kazPosition.column === cell.column;
                  const safeGlow = phase === "running" && (cell.safeGlowUntil > now || visionActive);
                  const markedDanger = signalLockActive && (cell.kind === "cursed" || cell.kind === "false-safe" || !!cell.spirit);
                  const floats = floatingTexts.filter((float) => float.index === cell.index);
                  return (
                    <button
                      aria-label={`Mist tile ${cell.row + 1}-${cell.column + 1}`}
                      className={[
                        "kaz-tile",
                        `kaz-tile-${cell.kind}`,
                        cell.mistActive ? "mist-active" : "",
                        safeGlow ? "safe-glow" : "",
                        markedDanger ? "danger-marked" : "",
                        isKaz ? "kaz-current-tile" : ""
                      ].join(" ")}
                      disabled={phase !== "running"}
                      key={cell.index}
                      style={{ "--kaz-column": cell.column, "--kaz-row": cell.row } as CSSProperties}
                      type="button"
                    >
                      <span className="kaz-tile-depth" />
                      {cell.collectible ? <span className={`kaz-pickup pickup-${cell.collectible}`}>{getCollectibleGlyph(cell.collectible)}</span> : null}
                      {cell.powerUp ? <span className="kaz-powerup">{getPowerUpGlyph(cell.powerUp)}</span> : null}
                      {cell.spirit ? <span className="kaz-spirit">{KAZ_SPIRIT_LABELS[cell.spirit].split(" ")[0]}</span> : null}
                      {cell.kind === "exit" ? <span className="kaz-exit-label">EXIT</span> : null}
                      {isKaz ? (
                        <span className={["kaz-player-token", shieldHits > 0 ? "kaz-shielded" : "", cyanSlashReady ? "kaz-cyan-slash-ready" : ""].join(" ")}>
                          <Image alt="Kaz player" height={130} src={KAZ_ASSET_PATH} width={90} />
                        </span>
                      ) : null}
                      {floats.map((float) => (
                        <span className={`kaz-score-float float-${float.tone}`} key={float.id}>
                          {float.text}
                        </span>
                      ))}
                    </button>
                  );
                })}
                {phase === "idle" ? (
                  <div className="kaz-attract-overlay">
                    <strong>Move Quietly</strong>
                    <p>Use WASD or arrow keys. Space slashes nearby spirits. Shift spends a shield step. Tap nearby tiles on mobile.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="kaz-action-bar">
              <button className="marcus-primary-button" disabled={phase === "running"} onClick={phase === "complete" ? replayRound : startRound} type="button">
                {phase === "running" ? "Moving" : phase === "complete" ? "Play Again" : "Start Path"}
              </button>
              <button className="mode-back-button" disabled={phase !== "running"} onClick={silentSlash} type="button">
                Silent Slash
              </button>
              <button className="mode-back-button" disabled={phase !== "running"} onClick={silenceStep} type="button">
                Silence Step
              </button>
              <p>{coldSurge ? "COLD SURGE." : "Arrow keys/WASD to move. Space to slash."}</p>
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
            <RewardRow label="Bonuses" value="+500 coins for exit. +250 coins for full hearts. +1 free spin above 75 stealth." />
            <RewardRow
              label="Current projection"
              value={`${rewardPreview.coins.toLocaleString()} coins, ${rewardPreview.freeSpins} free spins${rewardPreview.nextSpinMultiplier ? `, ${rewardPreview.nextSpinMultiplier}x next paid spin` : ""}`}
            />
          </aside>
        </div>
      </section>

      {phase === "complete" && result ? (
        <section className="marcus-end-screen" role="dialog" aria-modal="true" aria-labelledby="kaz-result-title">
          <div className="kaz-end-card">
            <Image alt="Kaz result art" height={420} src={KAZ_ASSET_PATH} width={280} />
            <div>
              <p>{result.flavorText}</p>
              <h2 id="kaz-result-title">Mist Report</h2>
              <div className="marcus-result-stats">
                <span>Score: {result.score.toLocaleString()}</span>
                <span>Best Combo: {result.bestCombo}</span>
                <span>Hearts: {result.heartsRemaining}/3</span>
                <span>Stealth: {result.stealth}%</span>
                <span>Distance: {Math.round((result.distanceReached / (KAZ_COLD_MIST_ROWS * KAZ_COLD_MIST_COLUMNS - 1)) * 100)}%</span>
                <span>Exit: {result.exitReached ? "Reached" : "Not reached"}</span>
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

function getCollectibleGlyph(collectible: string) {
  if (collectible === "ring-echo") return "ECHO";
  if (collectible === "mist-pearl") return "PEARL";
  if (collectible === "shield-seal") return "SEAL";
  return "ORB";
}

function getPowerUpGlyph(powerUp: string) {
  if (powerUp === "silence-field") return "FIELD";
  if (powerUp === "cyan-slash") return "SLASH";
  if (powerUp === "jason-vision-ping") return "VISION";
  if (powerUp === "pippa-signal-lock") return "LOCK";
  return "GUARD";
}
