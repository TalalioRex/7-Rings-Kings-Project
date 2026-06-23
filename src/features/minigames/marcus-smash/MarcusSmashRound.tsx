"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetById } from "@/lib/assets";
import {
  playBigWin,
  playButtonClick,
  playFreeSpinsStart,
  playMiniGameCombo,
  playMiniGameRewardClaim,
  playMiniGameRoundComplete,
  playMiniGameStart,
  playMiniGameTargetSmash,
  playMiniGameTargetSpawn,
  playMiniGameTimerWarning,
  playNormalWin,
  playScatterTrigger
} from "@/lib/audio";
import { STORAGE_KEYS } from "@/lib/gameConfig";
import {
  MARCUS_SMASH_COMBO_WINDOW_MS,
  MARCUS_SMASH_DURATION_SECONDS,
  MARCUS_SMASH_HEALTH,
  getWeightedMarcusFriendly,
  getWeightedMarcusPowerUp,
  getWeightedMarcusTarget
} from "@/features/minigames/marcus-smash/marcusSmashConfig";
import { getMarcusSmashReward, getMarcusSmashResult } from "@/features/minigames/marcus-smash/marcusSmashRewards";
import type {
  MarcusSmashFriendlyConfig,
  MarcusSmashPowerUpConfig,
  MarcusSmashResult,
  MarcusSmashTargetConfig,
  MiniGameReward
} from "@/features/minigames/marcus-smash/types";

type MarcusSmashRoundProps = {
  onExit: () => void;
  onClaimReward: (reward: MiniGameReward) => void;
};

type RoundPhase = "idle" | "running" | "complete";

type CellPop = {
  id: string;
  cellIndex: number;
  kind: "enemy" | "friendly" | "powerup";
  config: MarcusSmashTargetConfig | MarcusSmashFriendlyConfig | MarcusSmashPowerUpConfig;
  expiresAt: number;
};

type FloatingText = {
  id: string;
  cellIndex: number;
  text: string;
  tone: "good" | "bad" | "power";
};

const MARCUS_ASSET_PATH = "/assets/characters/marcus.png";
const CELL_COUNT = 9;

export function MarcusSmashRound({ onExit, onClaimReward }: MarcusSmashRoundProps) {
  const [phase, setPhase] = useState<RoundPhase>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(MARCUS_SMASH_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [health, setHealth] = useState(MARCUS_SMASH_HEALTH);
  const [message, setMessage] = useState("Marcus has entered the vegan aisle.");
  const [pops, setPops] = useState<CellPop[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [result, setResult] = useState<MarcusSmashResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [marcusImpactPulse, setMarcusImpactPulse] = useState(0);
  const [rageUntil, setRageUntil] = useState(0);
  const [freezeUntil, setFreezeUntil] = useState(0);
  const [scanUntil, setScanUntil] = useState(0);

  const roundEndsAtRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const healthRef = useRef(MARCUS_SMASH_HEALTH);
  const lastHitAtRef = useRef(0);
  const targetCounterRef = useRef(0);
  const warnedFrenzyRef = useRef(false);
  const phaseRef = useRef<RoundPhase>("idle");
  const gameplayBackground = getAssetById("gameplay-background")?.assetPath;

  const frenzy = phase === "running" && remainingSeconds <= 5;
  const rewardPreview = useMemo(() => getMarcusSmashReward(score, bestCombo, health), [bestCombo, health, score]);

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

      if (nextRemaining <= 5 && !warnedFrenzyRef.current) {
        warnedFrenzyRef.current = true;
        setMessage("MARCUS FRENZY!");
        playMiniGameTimerWarning(soundEnabled);
      }

      if (comboRef.current > 0 && now - lastHitAtRef.current > MARCUS_SMASH_COMBO_WINDOW_MS) {
        comboRef.current = 0;
        setCombo(0);
      }

      if (now >= roundEndsAtRef.current) {
        finishRound(false);
      }
    }, 100);

    const spawnId = window.setInterval(() => {
      if (phaseRef.current !== "running") return;
      spawnPop();
    }, frenzy ? 300 : remainingSeconds > 20 ? 850 : 550);

    const expireId = window.setInterval(() => {
      if (performance.now() < freezeUntil) return;
      expireOldPops();
    }, 100);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(spawnId);
      window.clearInterval(expireId);
    };
  }, [freezeUntil, frenzy, phase, remainingSeconds, soundEnabled]);

  function startRound() {
    playMiniGameStart(soundEnabled);
    scoreRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    healthRef.current = MARCUS_SMASH_HEALTH;
    lastHitAtRef.current = performance.now();
    roundEndsAtRef.current = performance.now() + MARCUS_SMASH_DURATION_SECONDS * 1000;
    warnedFrenzyRef.current = false;
    setPhase("running");
    setRemainingSeconds(MARCUS_SMASH_DURATION_SECONDS);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setHealth(MARCUS_SMASH_HEALTH);
    setMessage("Smash the cursed shelf before it judges you.");
    setPops([]);
    setFloatingTexts([]);
    setResult(null);
    setRageUntil(0);
    setFreezeUntil(0);
    setScanUntil(0);
  }

  function spawnPop() {
    setPops((current) => {
      const now = performance.now();
      const occupied = new Set(current.map((pop) => pop.cellIndex));
      const available = Array.from({ length: CELL_COUNT }, (_, index) => index).filter((index) => !occupied.has(index));
      if (!available.length) return current;

      const cellIndex = available[Math.floor(Math.random() * available.length)];
      const forceEnemy = frenzy || now < scanUntil;
      const roll = Math.random();
      const kind: CellPop["kind"] = forceEnemy ? "enemy" : roll > 0.9 ? "friendly" : roll > 0.78 ? "powerup" : "enemy";
      const config =
        kind === "enemy"
          ? getWeightedMarcusTarget()
          : kind === "friendly"
            ? getWeightedMarcusFriendly()
            : getWeightedMarcusPowerUp();
      targetCounterRef.current += 1;
      playMiniGameTargetSpawn(soundEnabled);
      return [
        ...current,
        {
          id: `${kind}-${targetCounterRef.current}`,
          cellIndex,
          kind,
          config,
          expiresAt: now + getLifetimeMs()
        }
      ];
    });
  }

  function smashPop(pop: CellPop) {
    if (phase !== "running") return;

    if (pop.kind === "enemy") {
      smashEnemy(pop);
      return;
    }

    if (pop.kind === "friendly") {
      smashFriendly(pop);
      return;
    }

    collectPowerUp(pop);
  }

  function smashEnemy(pop: CellPop) {
    const now = performance.now();
    const nextCombo = now - lastHitAtRef.current <= MARCUS_SMASH_COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
    const nextBest = Math.max(bestComboRef.current, nextCombo);
    const target = pop.config as MarcusSmashTargetConfig;
    const gained = target.points * getComboMultiplier(nextCombo) * (now < rageUntil ? 2 : 1);

    lastHitAtRef.current = now;
    comboRef.current = nextCombo;
    bestComboRef.current = nextBest;
    scoreRef.current += gained;
    setCombo(nextCombo);
    setBestCombo(nextBest);
    setScore(scoreRef.current);
    setMessage(getComboMessage(nextCombo));
    setMarcusImpactPulse((current) => current + 1);
    removePop(pop.id);
    addFloat(pop.cellIndex, `+${gained}`, "good");
    if (nextCombo === 3 || nextCombo === 6 || nextCombo === 10) {
      playMiniGameCombo(soundEnabled);
    } else {
      playMiniGameTargetSmash(soundEnabled);
    }
  }

  function smashFriendly(pop: CellPop) {
    const friendly = pop.config as MarcusSmashFriendlyConfig;
    scoreRef.current = Math.max(0, scoreRef.current - friendly.penalty);
    comboRef.current = 0;
    setScore(scoreRef.current);
    setCombo(0);
    setMessage(friendly.id === "pippa-scanner-beacon" ? "Pippa is judging you." : friendly.id === "kaz-cold-marker" ? "Kaz silently disapproves." : "Wrong target!");
    removePop(pop.id);
    addFloat(pop.cellIndex, `-${friendly.penalty}`, "bad");
    playScatterTrigger(soundEnabled);
  }

  function collectPowerUp(pop: CellPop) {
    const powerUp = pop.config as MarcusSmashPowerUpConfig;
    removePop(pop.id);
    addFloat(pop.cellIndex, powerUp.glyph, "power");
    setMessage(powerUp.displayName);
    playBigWin(soundEnabled);

    if (powerUp.id === "red-velocity-slam") {
      clearRow(Math.floor(pop.cellIndex / 3));
    } else if (powerUp.id === "marcus-rage") {
      setRageUntil(performance.now() + 5000);
    } else if (powerUp.id === "kaz-freeze") {
      setFreezeUntil(performance.now() + 3000);
    } else if (powerUp.id === "pippa-scan") {
      setScanUntil(performance.now() + 4000);
      setPops((current) => current.filter((active) => active.kind !== "friendly"));
    } else if (powerUp.id === "tala-chaos-spark") {
      const enemies = pops.filter((active) => active.kind === "enemy").slice(0, 3);
      smashEnemyBatch(enemies, "CHAOS!");
    }
  }

  function clearRow(row: number) {
    const rowStart = row * 3;
    const targets = pops.filter((pop) => pop.kind === "enemy" && pop.cellIndex >= rowStart && pop.cellIndex < rowStart + 3);
    smashEnemyBatch(targets, "ROW!");
    playFreeSpinsStart(soundEnabled);
  }

  function smashEnemyBatch(enemies: CellPop[], label: string) {
    if (!enemies.length) return;

    const now = performance.now();
    const rageMultiplier = now < rageUntil ? 2 : 1;
    const removedIds = new Set(enemies.map((enemy) => enemy.id));
    let gained = 0;

    enemies.forEach((target) => {
      const enemy = target.config as MarcusSmashTargetConfig;
      const points = enemy.points * rageMultiplier;
      gained += points;
      addFloat(target.cellIndex, `${label} +${points}`, "power");
    });

    scoreRef.current += gained;
    setScore(scoreRef.current);
    setMessage(label === "CHAOS!" ? "Tala Chaos Spark smashed the shelf." : "Red Velocity Slam cleared the row.");
    setMarcusImpactPulse((current) => current + 1);
    setPops((current) => current.filter((pop) => !removedIds.has(pop.id)));
  }

  function expireOldPops() {
    const now = performance.now();
    setPops((current) => {
      const expired = current.filter((pop) => pop.expiresAt <= now);
      if (!expired.length) return current;

      expired.forEach((pop) => {
        if (pop.kind === "enemy") {
          healthRef.current -= 1;
          comboRef.current = 0;
          setCombo(0);
          setHealth(Math.max(0, healthRef.current));
          setMessage(getMissMessage());
          addFloat(pop.cellIndex, "HIT!", "bad");
          setMarcusImpactPulse((currentPulse) => currentPulse + 1);
          playMiniGameTimerWarning(soundEnabled);
        }
      });

      if (healthRef.current <= 0) {
        window.setTimeout(() => finishRound(true), 0);
      }

      return current.filter((pop) => pop.expiresAt > now);
    });
  }

  function finishRound(endedByHealth: boolean) {
    if (phaseRef.current === "complete") return;
    phaseRef.current = "complete";
    const roundResult = getMarcusSmashResult(scoreRef.current, bestComboRef.current, Math.max(0, healthRef.current), endedByHealth);
    setResult(roundResult);
    setPhase("complete");
    setRemainingSeconds(0);
    setPops([]);
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
    playNormalWin(soundEnabled);
    startRound();
  }

  function removePop(popId: string) {
    setPops((current) => current.filter((pop) => pop.id !== popId));
  }

  function addFloat(cellIndex: number, text: string, tone: FloatingText["tone"]) {
    const id = `float-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setFloatingTexts((current) => [...current, { id, cellIndex, text, tone }]);
    window.setTimeout(() => {
      setFloatingTexts((current) => current.filter((item) => item.id !== id));
    }, 620);
  }

  return (
    <main
      className="marcus-smash-stage min-h-screen px-3 py-3 sm:px-5"
      style={gameplayBackground ? ({ "--gameplay-background": `url(${gameplayBackground})` } as CSSProperties) : undefined}
    >
      <section className="marcus-smash-shell mx-auto max-w-7xl">
        <header className="marcus-smash-header">
          <button className="mode-back-button" onClick={onExit} type="button">
            Back
          </button>
          <div>
            <p>Prototype Mini-Game / Aisle 7 Adventure remains Coming Soon</p>
            <h1>Marcus Smash Round</h1>
            <span>Vegan Aisle Incident / Smash the Cursed Vegan Shelf</span>
          </div>
          <div className="marcus-smash-notice">Demo coins only / no real-money systems</div>
        </header>

        <div className="marcus-smash-grid marcus-smash-grid-arcade">
          <aside className={["marcus-hero-panel", marcusImpactPulse ? "marcus-impact-flash" : ""].join(" ")} key={marcusImpactPulse}>
            <div className="marcus-hero-copy">
              <span>Marcus has entered the vegan aisle.</span>
              <strong>{message}</strong>
            </div>
            <div className="marcus-hero-art">
              <Image alt="Marcus character art" height={720} priority src={MARCUS_ASSET_PATH} width={480} />
              <div className="marcus-red-ring-energy" />
            </div>
            <p>These are cursed supernatural grocery enemies. Real vegan food is not the villain.</p>
          </aside>

          <section className={["marcus-arena-card marcus-arcade-card", frenzy ? "marcus-frenzy-card" : ""].join(" ")}>
            <div className="marcus-hud marcus-arcade-hud">
              <HudMetric label="Timer" value={`${remainingSeconds}s`} danger={remainingSeconds <= 5 && phase === "running"} />
              <HudMetric label="Score" value={score.toLocaleString()} />
              <HudMetric label="Combo" value={combo ? `x${getComboMultiplier(combo)}` : "x1"} />
              <HudMetric label="Best" value={String(bestCombo)} />
              <div className="marcus-hearts" aria-label={`${health} health remaining`}>
                {Array.from({ length: 3 }, (_, index) => (
                  <span className={index < health ? "heart-live" : "heart-lost"} key={index}>HEART</span>
                ))}
              </div>
            </div>

            <div className="phaser-board-shell">
              <div className="react-whack-board" aria-label="3x3 cursed vegan shelf">
                {Array.from({ length: CELL_COUNT }, (_, cellIndex) => {
                  const pop = pops.find((item) => item.cellIndex === cellIndex);
                  const floats = floatingTexts.filter((item) => item.cellIndex === cellIndex);
                  return (
                    <button
                      aria-label={pop ? `Smash ${pop.config.displayName}` : `Empty shelf compartment ${cellIndex + 1}`}
                      className={["react-whack-cell", pop ? `has-pop pop-${pop.kind}` : ""].join(" ")}
                      disabled={!pop || phase !== "running"}
                      key={cellIndex}
                      onPointerDown={() => pop && smashPop(pop)}
                      style={pop ? ({ "--pop-color": pop.config.color } as CSSProperties) : undefined}
                      type="button"
                    >
                      <span className="cell-glow" />
                      {pop ? (
                        <span className="react-pop-target">
                          <strong>{pop.config.glyph}</strong>
                          <em>{pop.config.displayName}</em>
                        </span>
                      ) : null}
                      {floats.map((float) => (
                        <span className={`react-smash-float float-${float.tone}`} key={float.id}>
                          {float.text}
                        </span>
                      ))}
                    </button>
                  );
                })}
                {phase === "idle" ? (
                  <div className="marcus-arcade-attract">
                    <strong>Ready?</strong>
                    <p>3x3 cursed shelf. Enemies pop out. Friendly targets are traps. Last 5 seconds: MARCUS FRENZY.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="marcus-arena-actions">
              <button className="marcus-primary-button" disabled={phase === "running"} onClick={phase === "complete" ? replayRound : startRound} type="button">
                {phase === "running" ? "Smashing" : phase === "complete" ? "Play Again" : "Start Round"}
              </button>
              <p>{frenzy ? "MARCUS FRENZY!" : "Smash cursed items. Avoid safe/friendly pop-ups."}</p>
            </div>
          </section>

          <aside className="marcus-reward-panel">
            <span>Reward Preview</span>
            <RewardRow label="0-499 points" value="250 coins" />
            <RewardRow label="500-999 points" value="500 coins" />
            <RewardRow label="1000-1499 points" value="750 coins + 1 free spin" />
            <RewardRow label="1500-2499 points" value="1000 coins + 3 free spins" />
            <RewardRow label="2500+ points" value="1500 coins + 5 free spins + 2x next paid spin" />
            <RewardRow label="Bonuses" value="+1 free spin for 10+ combo. +250 coins for full health." />
            <RewardRow
              label="Current projection"
              value={`${rewardPreview.coins.toLocaleString()} coins, ${rewardPreview.freeSpins} free spins${rewardPreview.nextSpinMultiplier ? `, ${rewardPreview.nextSpinMultiplier}x next paid spin` : ""}`}
            />
          </aside>
        </div>
      </section>

      {phase === "complete" && result ? (
        <section className="marcus-end-screen" role="dialog" aria-modal="true" aria-labelledby="marcus-result-title">
          <div className="marcus-end-card">
            <Image alt="Marcus result art" height={420} src={MARCUS_ASSET_PATH} width={280} />
            <div>
              <p>{result.flavorText}</p>
              <h2 id="marcus-result-title">Round Complete</h2>
              <div className="marcus-result-stats">
                <span>Score: {result.score.toLocaleString()}</span>
                <span>Best Combo: {result.bestCombo}</span>
                <span>Health: {result.healthRemaining}/3</span>
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

function getComboMessage(comboValue: number) {
  if (comboValue >= 10) return "VEGAN AISLE PANIC!";
  if (comboValue >= 6) return "MARCUS MODE!";
  if (comboValue >= 3) return "DOUBLE SMASH!";
  return "SMASH!";
}

function getLifetimeMs() {
  return 850 + Math.random() * 650;
}

function getMissMessage() {
  const messages = ["Oat milk counterattack!", "Tofu survived. Unacceptable.", "Plant burger launched emotional damage."];
  return messages[Math.floor(Math.random() * messages.length)];
}
