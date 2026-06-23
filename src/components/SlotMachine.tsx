"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameControls } from "@/components/GameControls";
import { PaytableModal } from "@/components/PaytableModal";
import { ReelGrid } from "@/components/ReelGrid";
import { SettingsModal } from "@/components/SettingsModal";
import { SlotMachineFrame } from "@/components/SlotMachineFrame";
import { WinDisplay } from "@/components/WinDisplay";
import { getAssetById, shrimpieJackpotArt } from "@/lib/assets";
import {
  playBigWin,
  playButtonClick,
  playCharacterSelect,
  playError,
  playFreeSpinsStart,
  playJackpotWin,
  playNormalWin,
  playReelStop,
  playScatterTrigger,
  playSpinStart
} from "@/lib/audio";
import { DEFAULT_PLAYER_CHARACTER_ID, PLAYER_CHARACTERS, getPlayerCharacter } from "@/lib/characters";
import {
  BET_OPTIONS,
  DEFAULT_BET,
  JACKPOT_CONTRIBUTION_RATE,
  JACKPOT_SEED,
  JACKPOT_SYMBOL_ID,
  STARTING_BALANCE,
  STORAGE_KEYS
} from "@/lib/gameConfig";
import { PAYLINES } from "@/lib/paylines";
import { SYMBOLS } from "@/lib/symbols";
import { evaluateSpin, generateGrid } from "@/lib/slotEngine";
import type { JackpotWin, LineWin, ScatterWin, SlotGrid, WinningPosition } from "@/types/slot";
import type { PlayerCharacterId } from "@/lib/characters";
import type { MiniGameReward } from "@/features/minigames/marcus-smash/types";

type SlotMachineProps = {
  miniGameReward?: MiniGameReward | null;
  onBackToModes: () => void;
  onMiniGameRewardApplied?: () => void;
};

export function SlotMachine({ miniGameReward, onBackToModes, onMiniGameRewardApplied }: SlotMachineProps) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [bet, setBet] = useState<number>(DEFAULT_BET);
  const [grid, setGrid] = useState<SlotGrid>(() => generateGrid(SYMBOLS));
  const [isSpinning, setIsSpinning] = useState(false);
  const [lineWins, setLineWins] = useState<LineWin[]>([]);
  const [winningPositions, setWinningPositions] = useState<WinningPosition[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [scatterWin, setScatterWin] = useState<ScatterWin | null>(null);
  const [jackpotWin, setJackpotWin] = useState<JackpotWin | null>(null);
  const [jackpotMeter, setJackpotMeter] = useState(JACKPOT_SEED);
  const [message, setMessage] = useState("A Very Suspicious 7-Eleven is ready.");
  const [scatterCount, setScatterCount] = useState(0);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [freeSpinsAwarded, setFreeSpinsAwarded] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [fastSpinEnabled, setFastSpinEnabled] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<PlayerCharacterId>(DEFAULT_PLAYER_CHARACTER_ID);
  const [talaBoostProgress, setTalaBoostProgress] = useState(0);
  const [nextSpinMultiplier, setNextSpinMultiplier] = useState<number | null>(null);
  const [showJackpotModal, setShowJackpotModal] = useState(false);
  const [jackpotArtPath, setJackpotArtPath] = useState<string>(shrimpieJackpotArt[0]?.assetPath ?? "/assets/jackpot/shrimpie-the-seventh/symbol.png");
  const reelStopTimeoutsRef = useRef<number[]>([]);

  const betIndex = useMemo(() => BET_OPTIONS.findIndex((option) => option === bet), [bet]);
  const selectedCharacter = useMemo(() => getPlayerCharacter(selectedCharacterId), [selectedCharacterId]);
  const gameplayBackground = getAssetById("gameplay-background")?.assetPath;
  const isFreeSpinMode = freeSpinsRemaining > 0;
  const canSpin = !isSpinning && (isFreeSpinMode || balance >= bet);
  const canChangeBet = !isSpinning && !isFreeSpinMode;
  const isTalaBoostReady = selectedCharacter.id === "tala" && talaBoostProgress === 2 && !isFreeSpinMode;

  useEffect(() => {
    const storedBalance = readNumber(STORAGE_KEYS.balance, STARTING_BALANCE);
    const storedBet = readNumber(STORAGE_KEYS.bet, DEFAULT_BET);
    setBalance(storedBalance);
    setBet(BET_OPTIONS.includes(storedBet as (typeof BET_OPTIONS)[number]) ? storedBet : DEFAULT_BET);
    setSoundEnabled(readBoolean(STORAGE_KEYS.sound, true));
    setMusicEnabled(readBoolean(STORAGE_KEYS.music, false));
    setFastSpinEnabled(readBoolean(STORAGE_KEYS.fastSpin, false));
    setJackpotMeter(readNumber(STORAGE_KEYS.jackpot, JACKPOT_SEED));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.balance, String(balance));
  }, [balance]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.bet, String(bet));
  }, [bet]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sound, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.music, String(musicEnabled));
  }, [musicEnabled]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.fastSpin, String(fastSpinEnabled));
  }, [fastSpinEnabled]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.jackpot, String(jackpotMeter));
  }, [jackpotMeter]);

  useEffect(() => {
    return () => {
      reelStopTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    if (!miniGameReward) return;
    applyMiniGameReward(miniGameReward);
    onMiniGameRewardApplied?.();
  }, [miniGameReward, onMiniGameRewardApplied]);

  function applyMiniGameReward(reward: MiniGameReward) {
    setBalance((current) => current + reward.coins);
    setFreeSpinsRemaining((current) => current + reward.freeSpins);
    setNextSpinMultiplier(reward.nextSpinMultiplier ?? null);
    if (reward.talaJackpotBoost) {
      setTalaBoostProgress((current) => Math.min(2, current + reward.talaJackpotBoost!));
    }
    playFreeSpinsStart(soundEnabled);
    const sourceLabel =
      reward.source === "tala-wild-spark"
        ? "Tala Wild Spark reward"
        : reward.source === "pippa-signal-scanner"
          ? "Pippa Signal Scanner reward"
          : reward.source === "kaz-cold-mist"
            ? "Kaz Cold Mist reward"
            : "Marcus Smash reward";
    setMessage(
      [
        `${sourceLabel} applied: ${reward.coins.toLocaleString()} demo coins`,
        reward.freeSpins ? `${reward.freeSpins} free spin${reward.freeSpins === 1 ? "" : "s"}` : null,
        reward.nextSpinMultiplier ? `${reward.nextSpinMultiplier}x next paid spin` : null,
        reward.talaJackpotBoost ? `+${reward.talaJackpotBoost} Tala demo boost` : null
      ]
        .filter(Boolean)
        .join(" + ") + "."
    );
  }

  function selectCharacter(characterId: PlayerCharacterId) {
    if (isSpinning) return;
    playCharacterSelect(soundEnabled);
    setSelectedCharacterId(characterId);
    setTalaBoostProgress(0);
  }

  function spin() {
    if (!canSpin) {
      playError(soundEnabled);
      setMessage("Not enough demo coins for the selected bet.");
      return;
    }

    const freeSpinActive = freeSpinsRemaining > 0;
    const nextTalaBoostProgress =
      selectedCharacter.id === "tala" && !freeSpinActive ? Math.min(3, talaBoostProgress + 1) : talaBoostProgress;
    const shouldForceTalaJackpot = selectedCharacter.id === "tala" && !freeSpinActive && nextTalaBoostProgress === 3;
    const nextGrid = shouldForceTalaJackpot ? createShrimpieJackpotGrid(generateGrid(SYMBOLS)) : generateGrid(SYMBOLS);
    const spinCost = freeSpinActive ? 0 : bet;
    const delay = fastSpinEnabled ? 1150 : 2050;

    playSpinStart(soundEnabled);
    reelStopTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    reelStopTimeoutsRef.current = [0.58, 0.72, 0.84, 0.94, 1].map((ratio) =>
      window.setTimeout(() => playReelStop(soundEnabled), Math.floor(delay * ratio))
    );

    setIsSpinning(true);
    setGrid(nextGrid);
    setLineWins([]);
    setWinningPositions([]);
    setLastWin(0);
    setScatterWin(null);
    setJackpotWin(null);
    setShowJackpotModal(false);
    setFreeSpinsAwarded(0);
    setScatterCount(0);
    setMessage(freeSpinActive ? "Free spin in progress." : "The suspicious reels are spinning.");
    setBalance((current) => current - spinCost);

    if (freeSpinActive) {
      setFreeSpinsRemaining((current) => Math.max(0, current - 1));
    } else if (selectedCharacter.id === "tala") {
      setTalaBoostProgress(nextTalaBoostProgress);
    }

    window.setTimeout(() => {
      const contribution = freeSpinActive ? 0 : Math.max(1, Math.round(bet * JACKPOT_CONTRIBUTION_RATE));
      const activeJackpotMeter = jackpotMeter + contribution;
      const evaluation = evaluateSpin(nextGrid, PAYLINES, bet, !freeSpinActive, activeJackpotMeter);
      const awarded = evaluation.freeSpinsAwarded;
      const baseWinTotal = evaluation.totalWin;
      const appliedSpinMultiplier = !freeSpinActive && nextSpinMultiplier ? nextSpinMultiplier : 1;
      const winTotal = baseWinTotal * appliedSpinMultiplier;

      setGrid(nextGrid);
      setLineWins(evaluation.lineWins);
      setWinningPositions(evaluation.winningPositions);
      setLastWin(winTotal);
      setScatterWin(evaluation.scatterWin);
      setJackpotWin(evaluation.jackpotWin);
      setScatterCount(evaluation.scatterCount);
      setFreeSpinsAwarded(awarded);
      setBalance((current) => current + winTotal);
      setJackpotMeter(evaluation.jackpotWin ? JACKPOT_SEED : activeJackpotMeter);
      setIsSpinning(false);
      if (!freeSpinActive && nextSpinMultiplier) {
        setNextSpinMultiplier(null);
      }

      if (awarded > 0) {
        setFreeSpinsRemaining(awarded);
      }

      if (evaluation.jackpotWin) {
        const randomArt = shrimpieJackpotArt[Math.floor(Math.random() * shrimpieJackpotArt.length)];
        setJackpotArtPath(randomArt?.assetPath ?? "/assets/jackpot/shrimpie-the-seventh/symbol.png");
        setShowJackpotModal(true);
        setTalaBoostProgress(0);
        playJackpotWin(soundEnabled);
        setMessage(`SHRIMPIE JACKPOT - ALL HAIL THE SEVENTH KING: ${evaluation.jackpotWin.amount.toLocaleString()} demo coins.`);
      } else if (awarded > 0 && winTotal > 0) {
        playFreeSpinsStart(soundEnabled);
        playScatterTrigger(soundEnabled);
        playBigWin(soundEnabled);
        setMessage(`${winTotal.toLocaleString()} coin win and ${awarded} free spins triggered.`);
      } else if (awarded > 0) {
        playFreeSpinsStart(soundEnabled);
        playScatterTrigger(soundEnabled);
        setMessage(`${awarded} free spins triggered by Aisle 7 Scatter.`);
      } else if (winTotal > 0) {
        if (winTotal >= bet * 10) {
          playBigWin(soundEnabled);
        } else {
          playNormalWin(soundEnabled);
        }
        const lineWinCopy = evaluation.lineWins.length
          ? `${evaluation.lineWins.length} payline win${evaluation.lineWins.length === 1 ? "" : "s"}`
          : "Scatter win";
        setMessage(
          `${lineWinCopy} paid ${winTotal.toLocaleString()} demo coins${appliedSpinMultiplier > 1 ? ` with Marcus ${appliedSpinMultiplier}x boost` : ""}.`
        );
      } else if (freeSpinActive) {
        setMessage("Free spin completed. No line win this time.");
      } else {
        setMessage("No win. The aisle stays cursed.");
      }
    }, delay);
  }

  function decreaseBet() {
    if (!canChangeBet || betIndex <= 0) return;
    playButtonClick(soundEnabled);
    setBet(BET_OPTIONS[betIndex - 1]);
  }

  function increaseBet() {
    if (!canChangeBet || betIndex >= BET_OPTIONS.length - 1) return;
    playButtonClick(soundEnabled);
    setBet(BET_OPTIONS[betIndex + 1]);
  }

  function resetBalance() {
    playButtonClick(soundEnabled);
    setTalaBoostProgress(0);
    setBalance(STARTING_BALANCE);
    setFreeSpinsRemaining(0);
    setLineWins([]);
    setWinningPositions([]);
    setLastWin(0);
    setScatterWin(null);
    setJackpotWin(null);
    setMessage("Demo balance reset.");
  }

  return (
    <main
      className="aisle-slot-stage min-h-screen px-3 py-3 sm:px-4 lg:px-6"
      style={gameplayBackground ? ({ "--gameplay-background": `url(${gameplayBackground})` } as CSSProperties) : undefined}
    >
      <section className="mx-auto flex max-w-7xl flex-col items-center">
        <div className="mb-4 flex w-full max-w-7xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
          <button className="mode-back-button" onClick={onBackToModes} type="button">
            Modes
          </button>
          <div className="rounded-md border border-neonGreen/30 bg-black/45 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-neonGreen shadow-neon sm:self-start">
            Demo coins only / no real-money systems
          </div>
        </div>

        <SlotMachineFrame
          balance={balance}
          bet={bet}
          freeSpinsRemaining={freeSpinsRemaining}
          isFreeSpinMode={isFreeSpinMode}
          jackpotMeter={jackpotMeter}
          lastWin={lastWin}
          characters={PLAYER_CHARACTERS}
          reelWindow={<ReelGrid grid={grid} isFreeSpinMode={isFreeSpinMode} isSpinning={isSpinning} winningPositions={winningPositions} />}
          resultPanel={
            <WinDisplay
              freeSpinsAwarded={freeSpinsAwarded}
              freeSpinsRemaining={freeSpinsRemaining}
              jackpotWin={jackpotWin}
              lastWin={lastWin}
              lineWins={lineWins}
              message={message}
              scatterWin={scatterWin}
              scatterCount={scatterCount}
            />
          }
          onSelectCharacter={selectCharacter}
          selectedCharacter={selectedCharacter}
          talaBoostProgress={selectedCharacter.id === "tala" ? talaBoostProgress : 0}
          controls={
            <GameControls
              balance={balance}
              bet={bet}
              canDecreaseBet={canChangeBet && betIndex > 0}
              canIncreaseBet={canChangeBet && betIndex < BET_OPTIONS.length - 1}
              canSpin={canSpin}
              isFreeSpinMode={isFreeSpinMode}
              isSpinning={isSpinning}
              isTalaBoostReady={isTalaBoostReady}
              onDecreaseBet={decreaseBet}
              onIncreaseBet={increaseBet}
              onOpenPaytable={() => {
                playButtonClick(soundEnabled);
                setShowPaytable(true);
              }}
              onOpenSettings={() => {
                playButtonClick(soundEnabled);
                setShowSettings(true);
              }}
              onSpin={spin}
            />
          }
        />
      </section>

      {showPaytable ? <PaytableModal onClose={() => setShowPaytable(false)} /> : null}
      {showSettings ? (
        <SettingsModal
          fastSpinEnabled={fastSpinEnabled}
          musicEnabled={musicEnabled}
          onClose={() => setShowSettings(false)}
          onResetBalance={resetBalance}
          onToggleFastSpin={() => {
            playButtonClick(soundEnabled);
            setFastSpinEnabled((current) => !current);
          }}
          onToggleMusic={() => {
            playButtonClick(soundEnabled);
            setMusicEnabled((current) => !current);
          }}
          onToggleSound={() => {
            playButtonClick(soundEnabled);
            setSoundEnabled((current) => !current);
          }}
          soundEnabled={soundEnabled}
        />
      ) : null}
      {showJackpotModal && jackpotWin ? (
        <ShrimpieJackpotModal
          amount={jackpotWin.amount}
          artPath={jackpotArtPath}
          onClose={() => {
            playButtonClick(soundEnabled);
            setShowJackpotModal(false);
          }}
        />
      ) : null}
    </main>
  );
}

function ShrimpieJackpotModal({ amount, artPath, onClose }: { amount: number; artPath: string; onClose: () => void }) {
  return (
    <div className="jackpot-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="shrimpie-jackpot-title">
      <section className="jackpot-modal-card">
        <div className="jackpot-confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, index) => (
            <span key={index} style={{ "--confetti-index": index } as CSSProperties} />
          ))}
        </div>
        <div className="jackpot-modal-copy">
          <p>ALL HAIL THE SEVENTH KING</p>
          <h2 id="shrimpie-jackpot-title">SHRIMPIE JACKPOT</h2>
          <strong>{amount.toLocaleString()} demo coins</strong>
        </div>
        <div className="jackpot-modal-art-wrap">
          <img alt="Shrimpie the Seventh jackpot artwork" className="jackpot-modal-art" src={artPath} />
        </div>
        <button className="jackpot-continue-button" onClick={onClose} type="button">
          Continue
        </button>
      </section>
    </div>
  );
}

function readNumber(key: string, fallback: number): number {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function readBoolean(key: string, fallback: boolean): boolean {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  return raw === "true";
}

function createShrimpieJackpotGrid(grid: SlotGrid): SlotGrid {
  return grid.map((reel) => [reel[0], JACKPOT_SYMBOL_ID, reel[2]]);
}


