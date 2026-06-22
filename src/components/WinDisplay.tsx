"use client";

import { useEffect, useState } from "react";
import type { JackpotWin, LineWin, ScatterWin } from "@/types/slot";

type WinDisplayProps = {
  lastWin: number;
  lineWins: LineWin[];
  scatterWin: ScatterWin | null;
  jackpotWin: JackpotWin | null;
  message: string;
  scatterCount: number;
  freeSpinsRemaining: number;
  freeSpinsAwarded: number;
};

export function WinDisplay({
  lastWin,
  lineWins,
  scatterWin,
  jackpotWin,
  message,
  scatterCount,
  freeSpinsRemaining,
  freeSpinsAwarded
}: WinDisplayProps) {
  const displayWin = useCountUp(lastWin);
  const isBigWin = lastWin >= 1000 || Boolean(jackpotWin);

  return (
    <section className={["win-display-panel rounded-t-md border bg-black/55 p-3 shadow-[inset_0_0_22px_rgba(64,245,255,0.08)] sm:p-4", jackpotWin ? "jackpot-win-panel border-yellow-300/50" : "border-white/10"].join(" ")}>
      {jackpotWin ? (
        <div className="shrimpie-jackpot-banner" role="status">
          <span>SHRIMPIE JACKPOT</span>
          <strong>THE SEVENTH KING AWAKENS</strong>
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Win Meter</p>
          <p className={["mt-1 text-2xl font-black", isBigWin ? "text-neonGreen" : "text-white"].join(" ")}>
            {displayWin > 0 ? `${Math.round(displayWin).toLocaleString()} coins` : "No win"}
          </p>
        </div>
        {freeSpinsRemaining > 0 ? (
          <div className="rounded-md border border-neonGreen/40 bg-neonGreen/10 px-4 py-2 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neonGreen">Free Spins</p>
            <p className="text-xl font-black text-white">{freeSpinsRemaining}</p>
          </div>
        ) : null}
      </div>

      <p className="mt-3 min-h-6 rounded border border-white/10 bg-void/70 px-3 py-2 text-center text-sm font-bold text-slate-200">
        {message}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat label="Line Wins" value={String(lineWins.length)} />
        <MiniStat label="Scatters" value={scatterWin ? `${scatterCount} / ${scatterWin.amount.toLocaleString()}` : String(scatterCount)} />
        <MiniStat label="Jackpot" value={jackpotWin ? jackpotWin.amount.toLocaleString() : "-"} />
      </div>
      {freeSpinsAwarded ? (
        <p className="mt-2 rounded border border-neonGreen/25 bg-neonGreen/10 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-neonGreen">
          {freeSpinsAwarded} free spins awarded
        </p>
      ) : null}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function useCountUp(target: number) {
  const [displayValue, setDisplayValue] = useState(target);

  useEffect(() => {
    if (target <= 0) {
      setDisplayValue(0);
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const duration = Math.min(1600, Math.max(500, target * 0.12));

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [target]);

  return displayValue;
}
