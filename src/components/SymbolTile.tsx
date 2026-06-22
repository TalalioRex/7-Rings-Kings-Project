"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { getSymbol } from "@/lib/symbols";

type SymbolTileProps = {
  symbolId: string;
  isWinning?: boolean;
  isSpinning?: boolean;
};

export function SymbolTile({ symbolId, isWinning = false, isSpinning = false }: SymbolTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const symbol = getSymbol(symbolId);
  const specialClass =
    symbol.type === "wild" ? "symbol-wild" : symbol.type === "scatter" ? "symbol-scatter" : symbol.type === "jackpot" ? "symbol-jackpot" : "";

  return (
    <div
      className={[
        "symbol-tile relative flex aspect-square min-h-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-black/80 p-1 sm:p-1.5",
        specialClass,
        isSpinning ? "reel-spinning" : "",
        isWinning ? "winning-tile symbol-winning" : ""
      ].join(" ")}
      style={{ "--symbol-glow": symbol.glowColor } as CSSProperties}
      title={symbol.displayName}
    >
      <div
        className="absolute inset-0 opacity-35"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${symbol.glowColor}66, transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.12), transparent 22%)`
        }}
      />
      <div className="absolute inset-[3px] rounded border border-white/10" />
      {symbol.assetPath && !imageFailed ? (
        <Image
          alt={symbol.displayName}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.45)]"
          height={160}
          onError={() => setImageFailed(true)}
          priority={false}
          src={symbol.assetPath}
          width={160}
        />
      ) : (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded bg-black/35 text-center">
          <span className="text-3xl font-black text-neonGreen">7</span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
            {symbol.type === "jackpot" ? "Jackpot" : "Scatter"}
          </span>
        </div>
      )}
      {symbol.type === "wild" ? <span className="symbol-badge wild-badge">Wild</span> : null}
      {symbol.type === "scatter" ? <span className="symbol-badge scatter-badge">Scatter</span> : null}
      {symbol.type === "jackpot" ? <span className="symbol-badge jackpot-badge">Jackpot</span> : null}
      <span className="sr-only">{symbol.displayName}</span>
    </div>
  );
}
