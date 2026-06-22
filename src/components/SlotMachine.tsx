"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameControls } from "@/components/GameControls";
import { PaytableModal } from "@/components/PaytableModal";
import { ReelGrid } from "@/components/ReelGrid";
import { SettingsModal } from "@/components/SettingsModal";
import { SlotMachineFrame } from "@/components/SlotMachineFrame";
import { WinDisplay } from "@/components/WinDisplay";
import { getAssetById } from "@/lib/assets";
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
import { DEFAULT_PLAYER_CHARACTER_ID, getPlayerCharacter } from "@/lib/playerCharacters";
import { SYMBOLS } from "@/lib/symbols";
import { evaluateSpin, generateGrid } from "@/lib/slotEngine";
import type { JackpotWin, LineWin, ScatterWin, SlotGrid, WinningPosition } from "@/types/slot";

type SlotMachineProps = {
  onBackToModes: () => void;
};

export function SlotMachine({ onBackToModes }: SlotMachineProps) {
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
  const [message, setMessage] = useState("Cursed Reels is ready.");
  const [scatterCount, setScatterCount] = useState(0);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [freeSpinsAwarded, setFreeSpinsAwarded] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [fastSpinEnabled, setFastSpinEnabled] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const paidSpinCountRef = useRef(0);

  const betIndex = useMemo(() => BET_OPTIONS.findIndex((option) => option === bet), [bet]);
  const selectedCharacter = useMemo(() => getPlayerCharacter(DEFAULT_PLAYER_CHARACTER_ID), []);
  const gameplayBackground = getAssetById("gameplay-background")?.assetPath;
  const isFreeSpinMode = freeSpinsRemaining > 0;
  const canSpin = !isSpinning && (isFreeSpinMode || balance >= bet);
  const canChangeBet = !isSpinning && !isFreeSpinMode;

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

  function spin() {
    if (!canSpin) {
      setMessage("Not enough demo coins for the selected bet.");
      return;
    }

    const freeSpinActive = freeSpinsRemaining > 0;
    const nextPaidSpinCount = freeSpinActive ? paidSpinCountRef.current : paidSpinCountRef.current + 1;
    const shouldForceTalaJackpot = selectedCharacter.id === "tala" && !freeSpinActive && nextPaidSpinCount === 3;
    const nextGrid = shouldForceTalaJackpot ? createShrimpieJackpotGrid(generateGrid(SYMBOLS)) : generateGrid(SYMBOLS);
    const spinCost = freeSpinActive ? 0 : bet;
    const delay = fastSpinEnabled ? 1150 : 2050;

    setIsSpinning(true);
    setGrid(nextGrid);
    setLineWins([]);
    setWinningPositions([]);
    setLastWin(0);
    setScatterWin(null);
    setJackpotWin(null);
    setFreeSpinsAwarded(0);
    setScatterCount(0);
    setMessage(freeSpinActive ? "Free spin in progress." : "The cursed reels are spinning.");
    setBalance((current) => current - spinCost);

    if (freeSpinActive) {
      setFreeSpinsRemaining((current) => Math.max(0, current - 1));
    } else {
      paidSpinCountRef.current = nextPaidSpinCount;
    }

    window.setTimeout(() => {
      const contribution = freeSpinActive ? 0 : Math.max(1, Math.round(bet * JACKPOT_CONTRIBUTION_RATE));
      const activeJackpotMeter = jackpotMeter + contribution;
      const evaluation = evaluateSpin(nextGrid, PAYLINES, bet, !freeSpinActive, activeJackpotMeter);
      const awarded = evaluation.freeSpinsAwarded;
      const winTotal = evaluation.totalWin;

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

      if (awarded > 0) {
        setFreeSpinsRemaining(awarded);
      }

      if (evaluation.jackpotWin) {
        setMessage(`SHRIMPIE JACKPOT - THE SEVENTH KING AWAKENS: ${evaluation.jackpotWin.amount.toLocaleString()} demo coins.`);
      } else if (awarded > 0 && winTotal > 0) {
        setMessage(`${winTotal.toLocaleString()} coin win and ${awarded} free spins triggered.`);
      } else if (awarded > 0) {
        setMessage(`${awarded} free spins triggered by Aisle 7 Scatter.`);
      } else if (winTotal > 0) {
        const lineWinCopy = evaluation.lineWins.length
          ? `${evaluation.lineWins.length} payline win${evaluation.lineWins.length === 1 ? "" : "s"}`
          : "Scatter win";
        setMessage(`${lineWinCopy} paid ${winTotal.toLocaleString()} demo coins.`);
      } else if (freeSpinActive) {
        setMessage("Free spin completed. No line win this time.");
      } else {
        setMessage("No win. The aisle stays cursed.");
      }
    }, delay);
  }

  function decreaseBet() {
    if (!canChangeBet || betIndex <= 0) return;
    setBet(BET_OPTIONS[betIndex - 1]);
  }

  function increaseBet() {
    if (!canChangeBet || betIndex >= BET_OPTIONS.length - 1) return;
    setBet(BET_OPTIONS[betIndex + 1]);
  }

  function resetBalance() {
    paidSpinCountRef.current = 0;
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
          selectedCharacter={selectedCharacter}
          controls={
            <GameControls
              balance={balance}
              bet={bet}
              canDecreaseBet={canChangeBet && betIndex > 0}
              canIncreaseBet={canChangeBet && betIndex < BET_OPTIONS.length - 1}
              canSpin={canSpin}
              isFreeSpinMode={isFreeSpinMode}
              isSpinning={isSpinning}
              onDecreaseBet={decreaseBet}
              onIncreaseBet={increaseBet}
              onOpenPaytable={() => setShowPaytable(true)}
              onOpenSettings={() => setShowSettings(true)}
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
          onToggleFastSpin={() => setFastSpinEnabled((current) => !current)}
          onToggleMusic={() => setMusicEnabled((current) => !current)}
          onToggleSound={() => setSoundEnabled((current) => !current)}
          soundEnabled={soundEnabled}
        />
      ) : null}
    </main>
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


