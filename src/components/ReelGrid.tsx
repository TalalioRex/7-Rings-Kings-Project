"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SlotGrid, WinningPosition } from "@/types/slot";
import { PAYLINES } from "@/lib/paylines";
import { SYMBOLS, getSymbol } from "@/lib/symbols";

type ReelGridProps = {
  grid: SlotGrid;
  winningPositions: WinningPosition[];
  isSpinning: boolean;
  isFreeSpinMode: boolean;
};

type ReelStopState = {
  baseOffset: number;
  stopStartedAt: number;
};

const REEL_COUNT = 5;
const ROW_COUNT = 3;
const REEL_STAGGER_MS = 135;
const REEL_SETTLE_MS = 620;
const SYMBOL_POOL = SYMBOLS.map((symbol) => symbol.id);

export function ReelGrid({ grid, winningPositions, isSpinning, isFreeSpinMode }: ReelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationRef = useRef<number | null>(null);
  const spinStartedAtRef = useRef<number>(0);
  const stopStatesRef = useRef<ReelStopState[] | null>(null);
  const previousSpinningRef = useRef(false);
  const gridRef = useRef(grid);
  const winningRef = useRef(winningPositions);

  const winningKeys = useMemo(() => new Set(winningPositions.map((position) => `${position.reel}:${position.row}`)), [winningPositions]);

  useEffect(() => {
    gridRef.current = grid;
    winningRef.current = winningPositions;
  }, [grid, winningPositions]);

  useEffect(() => {
    const imageMap = imageMapRef.current;

    SYMBOLS.forEach((symbol) => {
      if (!symbol.assetPath || imageMap.has(symbol.id)) return;

      const image = new Image();
      image.decoding = "async";
      image.src = symbol.assetPath;
      image.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (canvas && context) {
          drawSlotCanvas(context, canvas, gridRef.current, winningRef.current, imageMap, isFreeSpinMode, false, null);
        }
      };
      imageMap.set(symbol.id, image);
    });
  }, [isFreeSpinMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const activeCanvas = canvas;
    const activeContext = context;
    let disposed = false;

    function resizeCanvas() {
      const rect = activeCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, Math.floor(rect.width * dpr));
      const height = Math.max(260, Math.floor(rect.height * dpr));

      if (activeCanvas.width !== width || activeCanvas.height !== height) {
        activeCanvas.width = width;
        activeCanvas.height = height;
      }
    }

    function render(now: number) {
      if (disposed) return;

      resizeCanvas();

      if (isSpinning && !previousSpinningRef.current) {
        spinStartedAtRef.current = now;
        stopStatesRef.current = null;
      }

      if (!isSpinning && previousSpinningRef.current) {
        const metrics = getCanvasMetrics(activeCanvas);
        stopStatesRef.current = Array.from({ length: REEL_COUNT }, (_, reel) => ({
          baseOffset: getMovingOffset(now, spinStartedAtRef.current, metrics.tileHeight, reel),
          stopStartedAt: now + reel * REEL_STAGGER_MS
        }));
      }

      previousSpinningRef.current = isSpinning;

      drawSlotCanvas(
        activeContext,
        activeCanvas,
        gridRef.current,
        winningRef.current,
        imageMapRef.current,
        isFreeSpinMode,
        isSpinning,
        stopStatesRef.current,
        now,
        spinStartedAtRef.current
      );

      const stopsFinished =
        !isSpinning &&
        stopStatesRef.current?.every((state) => now - state.stopStartedAt > REEL_SETTLE_MS + 80);

      if (!isSpinning && stopsFinished) {
        stopStatesRef.current = null;
      }

      animationRef.current = window.requestAnimationFrame(render);
    }

    animationRef.current = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFreeSpinMode, isSpinning]);

  return (
    <div
      className={[
        "machine-scan premium-reel-window relative overflow-hidden rounded-md border",
        isFreeSpinMode ? "border-neonGreen/60" : "border-cyan-300/25"
      ].join(" ")}
    >
      <div className="pointer-events-none absolute left-1 top-0 z-20 flex h-full flex-col justify-around py-5">
        {[1, 2, 3].map((line) => (
          <span className="payline-tab rounded-r bg-neonPink/85 px-1.5 py-0.5 text-[10px] font-black text-black" key={line}>
            {line}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute right-1 top-0 z-20 flex h-full flex-col justify-around py-5">
        {[8, 9, 10].map((line) => (
          <span className="payline-tab rounded-l bg-neonCyan/85 px-1.5 py-0.5 text-[10px] font-black text-black" key={line}>
            {line}
          </span>
        ))}
      </div>
      <canvas
        aria-label="Five reel slot grid with three visible rows"
        className="premium-reel-canvas block h-full w-full"
        ref={canvasRef}
        role="img"
      />
      <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="sr-only">
        {grid.map((reel, reelIndex) => (
          <span key={`sr-reel-${reelIndex}`}>
            Reel {reelIndex + 1}: {reel.map((symbolId) => getSymbol(symbolId).displayName).join(", ")}.
          </span>
        ))}
        {winningKeys.size > 0 ? ` Winning cells: ${Array.from(winningKeys).join(", ")}.` : ""}
      </div>
    </div>
  );
}

function drawSlotCanvas(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  grid: SlotGrid,
  winningPositions: WinningPosition[],
  imageMap: Map<string, HTMLImageElement>,
  isFreeSpinMode: boolean,
  isSpinning: boolean,
  stopStates: ReelStopState[] | null,
  now = performance.now(),
  spinStartedAt = now
) {
  const metrics = getCanvasMetrics(canvas);
  const { width, height, padding, gap, reelWidth, tileHeight } = metrics;
  const activeWinningKeys = new Set(winningPositions.map((position) => `${position.reel}:${position.row}`));

  context.clearRect(0, 0, width, height);

  const frameGradient = context.createLinearGradient(0, 0, 0, height);
  frameGradient.addColorStop(0, "rgba(255,255,255,0.18)");
  frameGradient.addColorStop(0.14, "rgba(16,20,44,0.88)");
  frameGradient.addColorStop(0.5, "rgba(4,5,14,0.96)");
  frameGradient.addColorStop(1, "rgba(24,12,34,0.96)");
  context.fillStyle = frameGradient;
  roundRect(context, 0, 0, width, height, 20);
  context.fill();

  drawPaylineGhosts(context, metrics);

  for (let reel = 0; reel < REEL_COUNT; reel += 1) {
    const x = padding + reel * (reelWidth + gap);
    const stripX = x + 6;
    const stripWidth = reelWidth - 12;
    const stripY = padding + 6;
    const stripHeight = ROW_COUNT * tileHeight + (ROW_COUNT - 1) * gap - 12;
    const reelState = stopStates?.[reel] ?? null;
    const stopProgress = reelState ? clamp((now - reelState.stopStartedAt) / REEL_SETTLE_MS, 0, 1) : 1;
    const movingOffset = isSpinning
      ? getMovingOffset(now, spinStartedAt, tileHeight + gap, reel)
      : reelState
        ? reelState.baseOffset * (1 - easeOutBack(stopProgress))
        : 0;
    const blur = isSpinning || (reelState && stopProgress < 0.85) ? Math.max(0.4, 5.5 * (1 - stopProgress)) : 0;

    drawReelWell(context, x, padding, reelWidth, ROW_COUNT * tileHeight + (ROW_COUNT - 1) * gap, reel, isFreeSpinMode);

    context.save();
    context.beginPath();
    roundRect(context, stripX, stripY, stripWidth, stripHeight, 13);
    context.clip();

    if (blur > 0) {
      context.filter = `blur(${blur}px) saturate(1.45)`;
    }

    for (let row = -2; row < ROW_COUNT + 3; row += 1) {
      const y = padding + row * (tileHeight + gap) + movingOffset;
      const visibleRow = normalizeRow(row);
      const symbolId = isSpinning
        ? getMotionSymbol(reel, row, now, spinStartedAt)
        : grid[reel]?.[visibleRow] ?? SYMBOL_POOL[0];
      const isWinning = !isSpinning && !reelState && activeWinningKeys.has(`${reel}:${visibleRow}`);

      drawSymbolTile(context, stripX + 6, y + 6, stripWidth - 12, tileHeight - 12, symbolId, imageMap, isWinning, now);
    }

    context.restore();

    drawReelGlass(context, stripX, stripY, stripWidth, stripHeight, reel, isSpinning || Boolean(reelState));
  }

  drawWinConnectors(context, metrics, winningPositions, now);
  drawVignette(context, width, height);
}

function drawSymbolTile(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  symbolId: string,
  imageMap: Map<string, HTMLImageElement>,
  isWinning: boolean,
  now: number
) {
  const symbol = getSymbol(symbolId);
  const pulse = isWinning ? 0.55 + Math.sin(now / 120) * 0.25 : 0;
  const isJackpotSymbol = symbol.type === "jackpot";

  context.save();
  context.shadowColor = symbol.glowColor;
  context.shadowBlur = isJackpotSymbol ? 26 + pulse * 18 : isWinning ? 28 + pulse * 16 : 12;

  const tileGradient = context.createLinearGradient(x, y, x, y + height);
  tileGradient.addColorStop(0, "rgba(255,255,255,0.18)");
  tileGradient.addColorStop(0.18, hexToRgba(symbol.glowColor, 0.22));
  tileGradient.addColorStop(0.58, "rgba(13,14,31,0.96)");
  tileGradient.addColorStop(1, "rgba(2,3,10,0.98)");

  context.fillStyle = tileGradient;
  roundRect(context, x, y, width, height, 12);
  context.fill();

  context.lineWidth = isJackpotSymbol || isWinning ? 4 : 2;
  context.strokeStyle = isWinning ? "#5bffb5" : isJackpotSymbol ? "#ffd166" : hexToRgba(symbol.glowColor, 0.48);
  context.stroke();

  if (isJackpotSymbol) {
    context.strokeStyle = "rgba(255,79,216,0.62)";
    context.lineWidth = 2;
    roundRect(context, x + 5, y + 5, width - 10, height - 10, 11);
    context.stroke();
    context.strokeStyle = "rgba(64,245,255,0.5)";
    roundRect(context, x + 10, y + 10, width - 20, height - 20, 8);
    context.stroke();
  }

  context.shadowBlur = 0;
  context.fillStyle = hexToRgba(symbol.glowColor, isWinning ? 0.22 : 0.1);
  roundRect(context, x + 7, y + 7, width - 14, height - 14, 8);
  context.fill();

  const image = imageMap.get(symbolId);
  if (image?.complete && image.naturalWidth > 0) {
    const imageBox = containRect(image.naturalWidth, image.naturalHeight, x + 12, y + 10, width - 24, height - 20);
    context.drawImage(image, imageBox.x, imageBox.y, imageBox.width, imageBox.height);
  } else {
    drawFallbackSymbol(context, x, y, width, height, symbol.displayName, symbol.glowColor);
  }

  if (symbol.type === "wild" || symbol.type === "scatter" || symbol.type === "jackpot") {
    const label = symbol.type === "wild" ? "Wild" : symbol.type === "scatter" ? "Scatter" : "Jackpot";
    const badgeWidth = symbol.type === "wild" ? 52 : symbol.type === "scatter" ? 72 : 88;
    context.fillStyle = symbol.type === "wild" ? "#ff4764" : symbol.type === "scatter" ? "#5bffb5" : "#ffd166";
    roundRect(context, x + width / 2 - badgeWidth / 2, y + height - 22, badgeWidth, 16, 8);
    context.fill();
    context.fillStyle = "#050611";
    context.font = "900 9px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label.toUpperCase(), x + width / 2, y + height - 14);
  }

  if (isWinning) {
    context.strokeStyle = `rgba(91,255,181,${0.42 + pulse})`;
    context.lineWidth = 3;
    roundRect(context, x - 4, y - 4, width + 8, height + 8, 15);
    context.stroke();
  }

  context.restore();
}

function drawFallbackSymbol(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  glowColor: string
) {
  context.fillStyle = hexToRgba(glowColor, 0.22);
  roundRect(context, x + 18, y + 18, width - 36, height - 36, 12);
  context.fill();
  context.fillStyle = "#f8fbff";
  context.font = `950 ${Math.floor(height * 0.36)}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("7", x + width / 2, y + height * 0.43);
  context.font = "900 10px Arial";
  context.fillText(label.toUpperCase().slice(0, 10), x + width / 2, y + height * 0.68);
}

function drawReelWell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  reel: number,
  isFreeSpinMode: boolean
) {
  const gradient = context.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, "rgba(255,255,255,0.11)");
  gradient.addColorStop(0.35, "rgba(0,0,0,0.5)");
  gradient.addColorStop(1, isFreeSpinMode ? "rgba(25,77,55,0.42)" : "rgba(29,11,42,0.58)");
  context.fillStyle = gradient;
  roundRect(context, x, y, width, height, 16);
  context.fill();
  context.strokeStyle = reel % 2 === 0 ? "rgba(64,245,255,0.22)" : "rgba(255,79,216,0.2)";
  context.lineWidth = 2;
  context.stroke();
}

function drawReelGlass(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  reel: number,
  moving: boolean
) {
  context.save();
  const highlight = context.createLinearGradient(x, y, x + width, y);
  highlight.addColorStop(0, "rgba(255,255,255,0.04)");
  highlight.addColorStop(0.48, "rgba(255,255,255,0.15)");
  highlight.addColorStop(0.56, "rgba(255,255,255,0.02)");
  highlight.addColorStop(1, "rgba(255,255,255,0.06)");
  context.fillStyle = highlight;
  roundRect(context, x, y, width, height, 13);
  context.fill();

  if (moving) {
    context.fillStyle = reel % 2 === 0 ? "rgba(64,245,255,0.08)" : "rgba(255,79,216,0.08)";
    for (let line = 0; line < 12; line += 1) {
      context.fillRect(x, y + line * 28 + ((performance.now() / 18) % 28), width, 2);
    }
  }

  context.restore();
}

function drawPaylineGhosts(context: CanvasRenderingContext2D, metrics: ReturnType<typeof getCanvasMetrics>) {
  const { padding, gap, reelWidth, tileHeight } = metrics;
  context.save();
  context.lineWidth = 1.2;

  PAYLINES.forEach((payline, index) => {
    context.beginPath();
    payline.positions.forEach((row, reel) => {
      const x = padding + reel * (reelWidth + gap) + reelWidth / 2;
      const y = padding + row * (tileHeight + gap) + tileHeight / 2;
      if (reel === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.strokeStyle = index % 2 === 0 ? "rgba(255,79,216,0.08)" : "rgba(64,245,255,0.08)";
    context.stroke();
  });

  context.restore();
}

function drawWinConnectors(
  context: CanvasRenderingContext2D,
  metrics: ReturnType<typeof getCanvasMetrics>,
  winningPositions: WinningPosition[],
  now: number
) {
  if (winningPositions.length < 2) return;

  const { padding, gap, reelWidth, tileHeight } = metrics;
  const pulse = 0.45 + Math.sin(now / 130) * 0.2;

  context.save();
  context.strokeStyle = `rgba(91,255,181,${pulse})`;
  context.lineWidth = 3;
  context.shadowColor = "#5bffb5";
  context.shadowBlur = 18;
  context.beginPath();

  winningPositions
    .slice()
    .sort((a, b) => a.reel - b.reel || a.row - b.row)
    .forEach((position, index) => {
      const x = padding + position.reel * (reelWidth + gap) + reelWidth / 2;
      const y = padding + position.row * (tileHeight + gap) + tileHeight / 2;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });

  context.stroke();
  context.restore();
}

function drawVignette(context: CanvasRenderingContext2D, width: number, height: number) {
  const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.18, width / 2, height / 2, height * 0.78);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, "rgba(0,0,0,0.08)");
  vignette.addColorStop(1, "rgba(0,0,0,0.5)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function getCanvasMetrics(canvas: HTMLCanvasElement) {
  const width = canvas.width;
  const height = canvas.height;
  const padding = Math.max(22, width * 0.035);
  const gap = Math.max(8, width * 0.012);
  const reelWidth = (width - padding * 2 - gap * (REEL_COUNT - 1)) / REEL_COUNT;
  const tileHeight = (height - padding * 2 - gap * (ROW_COUNT - 1)) / ROW_COUNT;

  return { width, height, padding, gap, reelWidth, tileHeight };
}

function getMovingOffset(now: number, spinStartedAt: number, tileStep: number, reel: number) {
  const elapsed = Math.max(0, now - spinStartedAt);
  const acceleration = Math.min(1, elapsed / 360);
  const speed = (0.66 + reel * 0.035) * acceleration;
  return (elapsed * speed + reel * 37) % tileStep;
}

function getMotionSymbol(reel: number, row: number, now: number, spinStartedAt: number) {
  const frame = Math.floor((now - spinStartedAt) / (48 + reel * 5));
  const index = Math.abs((frame + row * 3 + reel * 7) % SYMBOL_POOL.length);
  return SYMBOL_POOL[index];
}

function normalizeRow(row: number) {
  return ((row % ROW_COUNT) + ROW_COUNT) % ROW_COUNT;
}

function easeOutBack(value: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function containRect(sourceWidth: number, sourceHeight: number, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;

  return {
    x: x + (width - renderedWidth) / 2,
    y: y + (height - renderedHeight) / 2,
    width: renderedWidth,
    height: renderedHeight
  };
}

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "");
  const value = Number.parseInt(cleaned.length === 3 ? cleaned.split("").map((char) => char + char).join("") : cleaned, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}
