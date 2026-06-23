"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  playButtonClick,
  playError,
  playMiniGameCombo,
  playMiniGameRewardClaim,
  playMiniGameRoundComplete,
  playMiniGameStart,
  playMiniGameTargetSmash,
  playMiniGameTimerWarning,
  playTalaLaneMove,
  playTalaPowerUp,
  playTalaSparkPickup
} from "@/lib/audio";
import { STORAGE_KEYS } from "@/lib/gameConfig";
import { getAssetById } from "@/lib/assets";
import {
  TALA_WILD_SPARK_COMBO_WINDOW_MS,
  TALA_WILD_SPARK_DURATION_SECONDS,
  TALA_WILD_SPARK_HEALTH,
  getWeightedTalaObject
} from "@/features/minigames/tala-wild-spark/talaWildSparkConfig";
import { getTalaWildSparkReward, getTalaWildSparkResult } from "@/features/minigames/tala-wild-spark/talaWildSparkRewards";
import type {
  TalaFallingObject,
  TalaLane,
  TalaObjectConfig,
  TalaWildSparkResult,
  TalaWildSparkReward
} from "@/features/minigames/tala-wild-spark/types";

type TalaWildSparkChaseProps = {
  onExit: () => void;
  onClaimReward: (reward: TalaWildSparkReward) => void;
};

type RoundPhase = "idle" | "running" | "complete";

type FloatingText = {
  id: string;
  lane: TalaLane;
  y: number;
  text: string;
  tone: "good" | "bad" | "power";
};

const TALA_ASSET_PATH = "/assets/characters/tala.png";
const LANE_COUNT = 3;

export function TalaWildSparkChase({ onExit, onClaimReward }: TalaWildSparkChaseProps) {
  const [phase, setPhase] = useState<RoundPhase>("idle");
  const [lane, setLane] = useState<TalaLane>(1);
  const [objects, setObjects] = useState<TalaFallingObject[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(TALA_WILD_SPARK_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [health, setHealth] = useState(TALA_WILD_SPARK_HEALTH);
  const [sparksCollected, setSparksCollected] = useState(0);
  const [message, setMessage] = useState("Tala has entered the candy aisle.");
  const [result, setResult] = useState<TalaWildSparkResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hitPulse, setHitPulse] = useState(0);
  const [wildModeUntil, setWildModeUntil] = useState(0);
  const [shieldUntil, setShieldUntil] = useState(0);
  const [warningUntil, setWarningUntil] = useState(0);
  const [slowUntil, setSlowUntil] = useState(0);

  const laneRef = useRef<TalaLane>(1);
  const phaseRef = useRef<RoundPhase>("idle");
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const healthRef = useRef(TALA_WILD_SPARK_HEALTH);
  const sparksRef = useRef(0);
  const lastCollectAtRef = useRef(0);
  const roundEndsAtRef = useRef(0);
  const nextSpawnAtRef = useRef(0);
  const objectCounterRef = useRef(0);
  const warnedFrenzyRef = useRef(false);
  const gameplayBackground = getAssetById("gameplay-background")?.assetPath;

  const now = typeof window === "undefined" ? 0 : performance.now();
  const frenzy = phase === "running" && remainingSeconds <= 7;
  const wildModeActive = phase === "running" && now < wildModeUntil;
  const shieldActive = phase === "running" && now < shieldUntil;
  const warningActive = phase === "running" && now < warningUntil;
  const slowed = phase === "running" && now < slowUntil;
  const rewardPreview = useMemo(() => getTalaWildSparkReward(score, bestCombo, health), [bestCombo, health, score]);

  useEffect(() => {
    const storedSound = window.localStorage.getItem(STORAGE_KEYS.sound);
    setSoundEnabled(storedSound === null ? true : storedSound === "true");
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (phaseRef.current !== "running") return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        moveLane(-1);
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        moveLane(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [soundEnabled]);

  useEffect(() => {
    if (phase !== "running") return;

    const tickId = window.setInterval(() => {
      const currentTime = performance.now();
      const nextRemaining = Math.max(0, Math.ceil((roundEndsAtRef.current - currentTime) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 7 && !warnedFrenzyRef.current) {
        warnedFrenzyRef.current = true;
        setMessage("WILD SPARK FRENZY!");
        playMiniGameTimerWarning(soundEnabled);
      }

      if (comboRef.current > 0 && currentTime - lastCollectAtRef.current > TALA_WILD_SPARK_COMBO_WINDOW_MS + 500) {
        comboRef.current = 0;
        setCombo(0);
      }

      if (currentTime >= roundEndsAtRef.current) {
        finishRound(false);
      }
    }, 100);

    const spawnId = window.setInterval(() => {
      if (phaseRef.current !== "running") return;
      const currentTime = performance.now();
      if (currentTime < nextSpawnAtRef.current) return;
      spawnObject(currentTime);
      nextSpawnAtRef.current = currentTime + getSpawnDelayMs(remainingSeconds);
    }, 90);

    const motionId = window.setInterval(() => {
      updateObjects();
    }, 50);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(spawnId);
      window.clearInterval(motionId);
    };
  }, [phase, remainingSeconds, soundEnabled, shieldUntil, slowUntil, wildModeUntil]);

  function startRound() {
    const currentTime = performance.now();
    playMiniGameStart(soundEnabled);
    phaseRef.current = "running";
    scoreRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    healthRef.current = TALA_WILD_SPARK_HEALTH;
    sparksRef.current = 0;
    lastCollectAtRef.current = currentTime;
    roundEndsAtRef.current = currentTime + TALA_WILD_SPARK_DURATION_SECONDS * 1000;
    nextSpawnAtRef.current = currentTime + 500;
    warnedFrenzyRef.current = false;
    setPhase("running");
    setLane(1);
    setObjects([]);
    setFloatingTexts([]);
    setRemainingSeconds(TALA_WILD_SPARK_DURATION_SECONDS);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setHealth(TALA_WILD_SPARK_HEALTH);
    setSparksCollected(0);
    setMessage("Collect Wild Sparks. Dodge the cursed candy.");
    setResult(null);
    setWildModeUntil(0);
    setShieldUntil(0);
    setWarningUntil(0);
    setSlowUntil(0);
  }

  function moveLane(direction: -1 | 1) {
    const nextLane = Math.max(0, Math.min(LANE_COUNT - 1, laneRef.current + direction)) as TalaLane;
    if (nextLane === laneRef.current) return;
    laneRef.current = nextLane;
    setLane(nextLane);
    playTalaLaneMove(soundEnabled);
  }

  function setLaneFromPointer(event: PointerEvent<HTMLDivElement>) {
    if (phase !== "running") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const nextLane = Math.max(0, Math.min(2, Math.floor((x / rect.width) * 3))) as TalaLane;
    if (nextLane !== laneRef.current) {
      laneRef.current = nextLane;
      setLane(nextLane);
      playTalaLaneMove(soundEnabled);
    }
  }

  function spawnObject(currentTime: number) {
    objectCounterRef.current += 1;
    const config = getWeightedTalaObject(remainingSeconds <= 7);
    const laneIndex = Math.floor(Math.random() * LANE_COUNT) as TalaLane;
    const baseSpeed = remainingSeconds <= 7 ? 2.8 : remainingSeconds <= 20 ? 2.05 : 1.55;
    const speed = baseSpeed + Math.random() * (remainingSeconds <= 7 ? 0.75 : 0.45);
    setObjects((current) => {
      if (current.length >= 8) return current;
      return [
        ...current,
        {
          id: `tala-object-${objectCounterRef.current}`,
          lane: laneIndex,
          y: -12,
          speed,
          config
        }
      ];
    });
    if (config.kind !== "hazard") {
      playTalaSparkPickup(false);
    }
    nextSpawnAtRef.current = currentTime + getSpawnDelayMs(remainingSeconds);
  }

  function updateObjects() {
    if (phaseRef.current !== "running") return;
    const currentTime = performance.now();
    const movementScale = currentTime < slowUntil ? 0.62 : 1;

    setObjects((current) => {
      const nextObjects: TalaFallingObject[] = [];

      current.forEach((object) => {
        const nextObject = { ...object, y: object.y + object.speed * movementScale };
        if (nextObject.y >= 76 && nextObject.y <= 92 && nextObject.lane === laneRef.current) {
          handleCollision(nextObject);
          return;
        }

        if (nextObject.y > 108) {
          if (nextObject.config.kind === "hazard") {
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
          return;
        }

        nextObjects.push(nextObject);
      });

      return nextObjects;
    });
  }

  function handleCollision(object: TalaFallingObject) {
    const currentTime = performance.now();
    const { config } = object;

    if (config.kind === "hazard" && currentTime < wildModeUntil) {
      collectPoints(config, object.lane, 120, "WILD +120", "power");
      setMessage("Wild Spark Mode turned danger into points.");
      return;
    }

    if (config.kind === "hazard") {
      handleHazard(config, object.lane);
      return;
    }

    if (config.kind === "powerup") {
      collectPoints(config, object.lane, config.points, `+${config.points}`, "power");
      activatePowerUp(config);
      return;
    }

    collectPoints(config, object.lane, config.points, `+${config.points}`, "good");
    if (config.id === "wild-spark" || config.id === "ring-spark") {
      sparksRef.current += 1;
      setSparksCollected(sparksRef.current);
    }
    setMessage(config.id === "ring-spark" ? "Rare Ring Spark collected." : "Wild Spark collected.");
    playTalaSparkPickup(soundEnabled);
  }

  function collectPoints(config: TalaObjectConfig, objectLane: TalaLane, basePoints: number, label: string, tone: FloatingText["tone"]) {
    const currentTime = performance.now();
    const nextCombo = currentTime - lastCollectAtRef.current <= TALA_WILD_SPARK_COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
    const multiplier = getComboMultiplier(nextCombo) * (currentTime < wildModeUntil ? 2 : 1);
    const points = basePoints * multiplier;
    const nextBest = Math.max(bestComboRef.current, nextCombo);

    lastCollectAtRef.current = currentTime;
    comboRef.current = nextCombo;
    bestComboRef.current = nextBest;
    scoreRef.current += points;
    setCombo(nextCombo);
    setBestCombo(nextBest);
    setScore(scoreRef.current);
    addFloat(objectLane, 74, multiplier > 1 ? `${label} x${multiplier}` : label, tone);
    if (nextCombo === 3 || nextCombo === 6 || nextCombo === 10) {
      setMessage(getComboMessage(nextCombo));
      playMiniGameCombo(soundEnabled);
    } else if (config.kind === "powerup") {
      playTalaPowerUp(soundEnabled);
    }
  }

  function handleHazard(config: TalaObjectConfig, objectLane: TalaLane) {
    if (performance.now() < shieldUntil) {
      setShieldUntil(0);
      addFloat(objectLane, 74, "BLOCKED", "power");
      setMessage("Heartstorm Bubble blocked the candy hit.");
      playTalaPowerUp(soundEnabled);
      return;
    }

    const nextHealth = Math.max(0, healthRef.current - 1);
    healthRef.current = nextHealth;
    comboRef.current = 0;
    scoreRef.current = Math.max(0, scoreRef.current + config.points);
    setHealth(nextHealth);
    setCombo(0);
    setScore(scoreRef.current);
    setHitPulse((current) => current + 1);
    addFloat(objectLane, 74, "HIT!", "bad");
    setMessage(getHazardMessage(config.id));
    playError(soundEnabled);

    if (config.effect === "slow") {
      setSlowUntil(performance.now() + 3000);
    } else if (config.effect === "knock") {
      const knockedLane = (objectLane === 0 ? 1 : objectLane === 1 ? 2 : 1) as TalaLane;
      laneRef.current = knockedLane;
      setLane(knockedLane);
    }

    if (nextHealth <= 0) {
      window.setTimeout(() => finishRound(true), 0);
    }
  }

  function activatePowerUp(config: TalaObjectConfig) {
    const currentTime = performance.now();
    if (config.effect === "wild-mode") {
      setWildModeUntil(currentTime + 5000);
      setMessage("Wild Spark Mode: cursed candy is worth points.");
    } else if (config.effect === "warning") {
      setWarningUntil(currentTime + 4000);
      setMessage("Pippa Warning Signal is highlighting danger.");
    } else if (config.effect === "shield") {
      setShieldUntil(currentTime + 5000);
      setMessage("Heartstorm Bubble is active.");
    } else if (config.effect === "clear-hazards") {
      const hazards = objects.filter((object) => object.config.kind === "hazard");
      setObjects((current) => current.filter((object) => object.config.kind !== "hazard"));
      const bonus = hazards.length * 75;
      scoreRef.current += bonus;
      setScore(scoreRef.current);
      setMessage(`Velocity Dash cleared ${hazards.length} cursed candy traps.`);
    }
    playTalaPowerUp(soundEnabled);
  }

  function finishRound(endedByHealth: boolean) {
    if (phaseRef.current === "complete") return;
    phaseRef.current = "complete";
    const roundResult = getTalaWildSparkResult(
      scoreRef.current,
      bestComboRef.current,
      Math.max(0, healthRef.current),
      sparksRef.current,
      endedByHealth
    );
    setResult(roundResult);
    setPhase("complete");
    setRemainingSeconds(0);
    setObjects([]);
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

  function addFloat(objectLane: TalaLane, y: number, text: string, tone: FloatingText["tone"]) {
    const id = `tala-float-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setFloatingTexts((current) => [...current, { id, lane: objectLane, y, text, tone }]);
    window.setTimeout(() => {
      setFloatingTexts((current) => current.filter((item) => item.id !== id));
    }, 720);
  }

  return (
    <main
      className="tala-spark-stage min-h-screen px-3 py-3 sm:px-5"
      style={gameplayBackground ? ({ "--gameplay-background": `url(${gameplayBackground})` } as CSSProperties) : undefined}
    >
      <section className="tala-spark-shell mx-auto max-w-7xl">
        <header className="tala-spark-header">
          <button className="mode-back-button" onClick={onExit} type="button">
            Back
          </button>
          <div>
            <p>Prototype Mini-Game / Aisle 7 Adventure remains Coming Soon</p>
            <h1>Tala Wild Spark Chase</h1>
            <span>Candy Aisle Chaos / Collect sparks, dodge cursed sweets</span>
          </div>
          <div className="marcus-smash-notice">Demo coins only / no real-money systems</div>
        </header>

        <div className="tala-spark-grid">
          <aside className={["tala-hero-panel", hitPulse ? "tala-hit-flash" : ""].join(" ")} key={hitPulse}>
            <div className="tala-hero-copy">
              <span>Pippa warned her.</span>
              <strong>{message}</strong>
            </div>
            <div className="tala-hero-art">
              <Image alt="Tala character art" height={720} priority src={TALA_ASSET_PATH} width={480} />
            </div>
            <p>No final reveal in this prototype. These are cursed supernatural candy enemies.</p>
          </aside>

          <section className={["tala-arcade-card", frenzy ? "tala-frenzy-card" : "", wildModeActive ? "tala-wild-mode-card" : ""].join(" ")}>
            <div className="tala-hud">
              <HudMetric label="Timer" value={`${remainingSeconds}s`} danger={remainingSeconds <= 7 && phase === "running"} />
              <HudMetric label="Score" value={score.toLocaleString()} />
              <HudMetric label="Combo" value={combo ? `x${getComboMultiplier(combo)}` : "x1"} />
              <HudMetric label="Sparks" value={String(sparksCollected)} />
              <div className="marcus-hearts" aria-label={`${health} health remaining`}>
                {Array.from({ length: 3 }, (_, index) => (
                  <span className={index < health ? "heart-live" : "heart-lost"} key={index}>HEART</span>
                ))}
              </div>
            </div>

            <div className="tala-aisle-board" onPointerDown={setLaneFromPointer} role="application" aria-label="Tala Wild Spark lane chase">
              <div className="tala-lane-grid" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="tala-aisle-depth" aria-hidden="true" />
              {objects.map((object) => (
                <button
                  aria-label={object.config.displayName}
                  className={[
                    "tala-falling-object",
                    `tala-object-${object.config.kind}`,
                    warningActive && object.config.kind === "hazard" ? "danger-highlight" : ""
                  ].join(" ")}
                  key={object.id}
                  style={{
                    "--lane": object.lane,
                    "--object-y": `${object.y}%`,
                    "--object-color": object.config.color
                  } as CSSProperties}
                  tabIndex={-1}
                  type="button"
                >
                  <strong>{object.config.glyph}</strong>
                  <em>{object.config.displayName}</em>
                </button>
              ))}
              {floatingTexts.map((float) => (
                <span
                  className={`tala-score-float float-${float.tone}`}
                  key={float.id}
                  style={{ "--lane": float.lane, "--object-y": `${float.y}%` } as CSSProperties}
                >
                  {float.text}
                </span>
              ))}
              <div
                className={[
                  "tala-player",
                  wildModeActive ? "tala-player-wild" : "",
                  shieldActive ? "tala-player-shielded" : "",
                  slowed ? "tala-player-slowed" : ""
                ].join(" ")}
                style={{ "--lane": lane } as CSSProperties}
              >
                <Image alt="Tala player" height={260} src={TALA_ASSET_PATH} width={170} />
              </div>
              {phase === "idle" ? (
                <div className="tala-attract-overlay">
                  <strong>Ready?</strong>
                  <p>Move with A/D or arrow keys. Tap a lane on mobile. Collect pink Wild Sparks and avoid cursed candy.</p>
                </div>
              ) : null}
            </div>

            <div className="marcus-arena-actions">
              <button className="marcus-primary-button" disabled={phase === "running"} onClick={phase === "complete" ? replayRound : startRound} type="button">
                {phase === "running" ? "Chasing" : phase === "complete" ? "Play Again" : "Start Chase"}
              </button>
              <p>{frenzy ? "WILD SPARK FRENZY!" : "Keyboard: A/D or Arrow Left/Right. Mobile: tap a lane."}</p>
            </div>
          </section>

          <aside className="marcus-reward-panel">
            <span>Reward Preview</span>
            <RewardRow label="0-499 points" value="250 coins" />
            <RewardRow label="500-999 points" value="500 coins" />
            <RewardRow label="1000-1499 points" value="750 coins + 1 free spin" />
            <RewardRow label="1500-2499 points" value="1000 coins + 3 free spins" />
            <RewardRow label="2500-3499 points" value="1500 coins + 5 free spins" />
            <RewardRow label="3500+ points" value="2000 coins + 5 free spins + 1 Tala boost" />
            <RewardRow label="Bonuses" value="+1 free spin for 10+ combo. +250 coins for full health." />
            <RewardRow
              label="Current projection"
              value={`${rewardPreview.coins.toLocaleString()} coins, ${rewardPreview.freeSpins} free spins${rewardPreview.talaJackpotBoost ? ", +1 Tala boost" : ""}`}
            />
          </aside>
        </div>
      </section>

      {phase === "complete" && result ? (
        <section className="marcus-end-screen" role="dialog" aria-modal="true" aria-labelledby="tala-result-title">
          <div className="tala-end-card">
            <Image alt="Tala result art" height={420} src={TALA_ASSET_PATH} width={280} />
            <div>
              <p>{result.flavorText}</p>
              <h2 id="tala-result-title">Chase Complete</h2>
              <div className="marcus-result-stats">
                <span>Score: {result.score.toLocaleString()}</span>
                <span>Best Combo: {result.bestCombo}</span>
                <span>Hearts: {result.healthRemaining}/3</span>
                <span>Sparks: {result.sparksCollected}</span>
              </div>
              <div className="marcus-reward-list">
                <span>{result.reward.coins.toLocaleString()} demo coins</span>
                <span>{result.reward.freeSpins} free spins</span>
                {result.reward.talaJackpotBoost ? <span>+{result.reward.talaJackpotBoost} Tala demo boost</span> : null}
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

function getComboMessage(comboValue: number) {
  if (comboValue >= 10) return "FORBIDDEN CANDY ENLIGHTENMENT!";
  if (comboValue >= 6) return "WILD SPARK SURGE!";
  if (comboValue >= 3) return "DOUBLE SPARK!";
  return "Spark collected.";
}

function getSpawnDelayMs(remainingSeconds: number) {
  if (remainingSeconds <= 7) return 350 + Math.random() * 250;
  if (remainingSeconds <= 20) return 650 + Math.random() * 250;
  return 900 + Math.random() * 300;
}

function getHazardMessage(hazardId: string) {
  if (hazardId === "sour-strip-trap") return "Sour strip slowdown. Pippa definitely saw that.";
  if (hazardId === "marshmallow-bouncer") return "Marshmallow impact. Tala has been repositioned.";
  if (hazardId === "lollipop-watcher") return "The lollipop watcher disapproves.";
  if (hazardId === "cursed-gummy-worm") return "Cursed gummy worm contact.";
  return "Tala touched the forbidden candy. Again.";
}
