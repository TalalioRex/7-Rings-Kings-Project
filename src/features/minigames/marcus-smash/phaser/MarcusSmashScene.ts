import {
  MARCUS_SMASH_COMBO_WINDOW_MS,
  MARCUS_SMASH_DURATION_SECONDS,
  MARCUS_SMASH_GRID_COLUMNS,
  MARCUS_SMASH_GRID_ROWS,
  MARCUS_SMASH_HEALTH,
  getWeightedMarcusFriendly,
  getWeightedMarcusPowerUp,
  getWeightedMarcusTarget
} from "@/features/minigames/marcus-smash/marcusSmashConfig";
import { getMarcusSmashResult } from "@/features/minigames/marcus-smash/marcusSmashRewards";
import type {
  MarcusSmashFriendlyConfig,
  MarcusSmashHudState,
  MarcusSmashPowerUpConfig,
  MarcusSmashResult,
  MarcusSmashTargetConfig
} from "@/features/minigames/marcus-smash/types";

type PhaserModule = typeof import("phaser");
type PhaserGameObjectsContainer = import("phaser").GameObjects.Container;
type PhaserGameObjectsGraphics = import("phaser").GameObjects.Graphics;
type PhaserTimeEvent = import("phaser").Time.TimerEvent;

export type MarcusSmashSoundEvent =
  | "start"
  | "target-pop"
  | "smash-hit"
  | "miss-hit"
  | "marcus-hit"
  | "powerup"
  | "row-clear"
  | "combo"
  | "frenzy"
  | "round-complete";

export type MarcusSmashSceneOptions = {
  onHudUpdate: (hud: MarcusSmashHudState) => void;
  onComplete: (result: MarcusSmashResult) => void;
  onSound: (event: MarcusSmashSoundEvent) => void;
};

type ActivePop = {
  id: string;
  cellIndex: number;
  kind: "enemy" | "friendly" | "powerup";
  config: MarcusSmashTargetConfig | MarcusSmashFriendlyConfig | MarcusSmashPowerUpConfig;
  container: PhaserGameObjectsContainer;
  expiresAt: number;
  row: number;
};

const GAME_WIDTH = 900;
const GAME_HEIGHT = 620;
const BOARD_LEFT = 104;
const BOARD_TOP = 102;
const CELL_WIDTH = 210;
const CELL_HEIGHT = 132;
const CELL_GAP = 22;

export function createMarcusSmashScene(Phaser: PhaserModule, options: MarcusSmashSceneOptions) {
  return class MarcusSmashScene extends Phaser.Scene {
    private activePops = new Map<number, ActivePop>();
    private shelfCells: PhaserGameObjectsGraphics[] = [];
    private cracks: PhaserGameObjectsGraphics[] = [];
    private spawnEvent: PhaserTimeEvent | null = null;
    private timerEvent: PhaserTimeEvent | null = null;
    private score = 0;
    private combo = 0;
    private bestCombo = 0;
    private health = MARCUS_SMASH_HEALTH;
    private remainingSeconds = MARCUS_SMASH_DURATION_SECONDS;
    private lastHitAt = 0;
    private ended = false;
    private frenzy = false;
    private rageUntil = 0;
    private frozenUntil = 0;
    private scanUntil = 0;
    private message = "Marcus has entered the vegan aisle.";
    private roundStartedAt = 0;
    private marcusPulse: PhaserGameObjectsGraphics | null = null;

    constructor() {
      super("MarcusSmashScene");
    }

    create() {
      this.activePops.clear();
      this.shelfCells = [];
      this.cracks = [];
      this.score = 0;
      this.combo = 0;
      this.bestCombo = 0;
      this.health = MARCUS_SMASH_HEALTH;
      this.remainingSeconds = MARCUS_SMASH_DURATION_SECONDS;
      this.lastHitAt = 0;
      this.ended = false;
      this.frenzy = false;
      this.rageUntil = 0;
      this.frozenUntil = 0;
      this.scanUntil = 0;
      this.message = "Marcus has entered the vegan aisle.";
      this.roundStartedAt = this.time.now;

      this.drawBackground();
      this.drawShelfBoard();
      this.drawMarcusEnergy();
      this.emitHud();
      options.onSound("start");

      this.spawnEvent = this.time.addEvent({
        delay: 850,
        loop: true,
        callback: () => this.spawnPop()
      });

      this.timerEvent = this.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => this.tickRound()
      });
    }

    update() {
      if (this.ended) return;
      const now = this.time.now;

      if (this.combo > 0 && now - this.lastHitAt > MARCUS_SMASH_COMBO_WINDOW_MS) {
        this.combo = 0;
        this.emitHud();
      }

      if (now < this.frozenUntil) return;

      this.activePops.forEach((pop) => {
        if (now >= pop.expiresAt) {
          this.expirePop(pop);
        }
      });
    }

    private drawBackground() {
      this.cameras.main.setBackgroundColor("#03050e");

      const back = this.add.graphics();
      back.fillGradientStyle(0x210718, 0x061a16, 0x050611, 0x12051e, 1);
      back.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      for (let index = 0; index < 13; index += 1) {
        const x = 36 + index * 68;
        back.lineStyle(1, 0x5bffb5, 0.08);
        back.lineBetween(x, 0, x - 80, GAME_HEIGHT);
      }

      back.lineStyle(8, 0xff4764, 0.22);
      back.strokeRoundedRect(20, 20, GAME_WIDTH - 40, GAME_HEIGHT - 40, 24);
      back.lineStyle(3, 0x40f5ff, 0.28);
      back.strokeRoundedRect(34, 34, GAME_WIDTH - 68, GAME_HEIGHT - 68, 18);
    }

    private drawShelfBoard() {
      const board = this.add.graphics();
      board.fillStyle(0x050611, 0.76);
      board.fillRoundedRect(BOARD_LEFT - 36, BOARD_TOP - 42, CELL_WIDTH * 3 + CELL_GAP * 2 + 72, CELL_HEIGHT * 3 + CELL_GAP * 2 + 84, 24);
      board.lineStyle(4, 0x5bffb5, 0.28);
      board.strokeRoundedRect(BOARD_LEFT - 36, BOARD_TOP - 42, CELL_WIDTH * 3 + CELL_GAP * 2 + 72, CELL_HEIGHT * 3 + CELL_GAP * 2 + 84, 24);

      for (let row = 0; row < MARCUS_SMASH_GRID_ROWS; row += 1) {
        for (let col = 0; col < MARCUS_SMASH_GRID_COLUMNS; col += 1) {
          const index = row * MARCUS_SMASH_GRID_COLUMNS + col;
          const { x, y } = this.getCellCenter(index);
          const cell = this.add.graphics();
          cell.fillGradientStyle(0x050611, 0x13221e, 0x090a16, 0x1d0b2a, 1);
          cell.fillRoundedRect(x - CELL_WIDTH / 2, y - CELL_HEIGHT / 2, CELL_WIDTH, CELL_HEIGHT, 18);
          cell.lineStyle(3, row % 2 === 0 ? 0x5bffb5 : 0xb983ff, 0.38);
          cell.strokeRoundedRect(x - CELL_WIDTH / 2, y - CELL_HEIGHT / 2, CELL_WIDTH, CELL_HEIGHT, 18);
          cell.fillStyle(0x000000, 0.32);
          cell.fillEllipse(x, y + 28, CELL_WIDTH * 0.76, 26);
          this.shelfCells.push(cell);
        }
      }
    }

    private drawMarcusEnergy() {
      this.marcusPulse = this.add.graphics();
      this.marcusPulse.lineStyle(5, 0xff4764, 0.28);
      this.marcusPulse.strokeCircle(48, GAME_HEIGHT - 58, 34);
      this.tweens.add({
        targets: this.marcusPulse,
        alpha: 0.35,
        duration: 650,
        yoyo: true,
        repeat: -1
      });
    }

    private tickRound() {
      if (this.ended) return;
      const elapsed = (this.time.now - this.roundStartedAt) / 1000;
      const nextRemaining = Math.max(0, Math.ceil(MARCUS_SMASH_DURATION_SECONDS - elapsed));

      if (nextRemaining !== this.remainingSeconds) {
        this.remainingSeconds = nextRemaining;
        if (nextRemaining <= 5 && !this.frenzy) {
          this.startFrenzy();
        }
        this.emitHud();
      }

      if (elapsed >= MARCUS_SMASH_DURATION_SECONDS) {
        this.finishRound(false);
      }
    }

    private spawnPop() {
      if (this.ended) return;
      const availableCells = Array.from({ length: 9 }, (_, index) => index).filter((index) => !this.activePops.has(index));
      if (!availableCells.length) return;

      const now = this.time.now;
      const elapsed = (now - this.roundStartedAt) / 1000;
      const spawnChance = elapsed < 10 ? 0.72 : elapsed < 25 ? 0.9 : 1;
      if (Math.random() > spawnChance) return;

      const cellIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
      const roll = Math.random();
      const forceEnemy = this.frenzy || now < this.scanUntil;
      const kind: ActivePop["kind"] = forceEnemy ? "enemy" : roll > 0.89 ? "friendly" : roll > 0.78 ? "powerup" : "enemy";
      const config =
        kind === "enemy"
          ? getWeightedMarcusTarget()
          : kind === "friendly"
            ? getWeightedMarcusFriendly()
            : getWeightedMarcusPowerUp();
      const lifetime = this.getTargetLifetime();
      const pop = this.createPop(cellIndex, kind, config, now + lifetime);

      this.activePops.set(cellIndex, pop);
      options.onSound("target-pop");
    }

    private createPop(
      cellIndex: number,
      kind: ActivePop["kind"],
      config: MarcusSmashTargetConfig | MarcusSmashFriendlyConfig | MarcusSmashPowerUpConfig,
      expiresAt: number
    ): ActivePop {
      const { x, y } = this.getCellCenter(cellIndex);
      const row = Math.floor(cellIndex / MARCUS_SMASH_GRID_COLUMNS);
      const color = Number.parseInt(config.color.replace("#", ""), 16);
      const container = this.add.container(x, y + 36);
      const body = this.add.graphics();
      const label = this.add.text(0, -8, config.glyph, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: kind === "powerup" ? "17px" : "18px",
        fontStyle: "900",
        align: "center"
      }).setOrigin(0.5);
      const name = this.add.text(0, 20, config.displayName, {
        color: "#e2e8f0",
        fontFamily: "Arial",
        fontSize: "11px",
        fontStyle: "700",
        align: "center",
        wordWrap: { width: 130 }
      }).setOrigin(0.5);

      body.fillStyle(0x000000, 0.84);
      body.fillRoundedRect(-70, -52, 140, 104, 18);
      body.lineStyle(4, color, kind === "friendly" ? 0.78 : 0.62);
      body.strokeRoundedRect(-70, -52, 140, 104, 18);
      body.fillStyle(color, kind === "powerup" ? 0.3 : 0.18);
      body.fillCircle(0, -14, 34);

      if (kind === "friendly") {
        body.lineStyle(3, 0xffffff, 0.62);
        body.strokeCircle(0, -14, 38);
      }

      if (kind === "powerup") {
        body.lineStyle(3, 0xffd166, 0.76);
        body.strokeCircle(0, -14, 42);
        body.lineBetween(-30, -14, 30, -14);
        body.lineBetween(0, -44, 0, 16);
      }

      container.add([body, label, name]);
      container.setSize(150, 112);
      container.setInteractive(new Phaser.Geom.Rectangle(-75, -56, 150, 112), Phaser.Geom.Rectangle.Contains);
      container.on("pointerdown", () => this.hitPop(cellIndex));

      container.setScale(0.45);
      this.tweens.add({
        targets: container,
        y,
        scale: 1,
        duration: 180,
        ease: "Back.Out"
      });
      this.tweens.add({
        targets: container,
        angle: kind === "friendly" ? 1 : 2,
        duration: 220,
        yoyo: true,
        repeat: -1
      });

      return {
        id: `${kind}-${cellIndex}-${this.time.now}`,
        cellIndex,
        kind,
        config,
        container,
        expiresAt,
        row
      };
    }

    private hitPop(cellIndex: number) {
      const pop = this.activePops.get(cellIndex);
      if (!pop || this.ended) return;

      if (pop.kind === "enemy") {
        this.hitEnemy(pop);
      } else if (pop.kind === "friendly") {
        this.hitFriendly(pop);
      } else {
        this.hitPowerUp(pop);
      }
    }

    private hitEnemy(pop: ActivePop) {
      const now = this.time.now;
      const continuedCombo = now - this.lastHitAt <= MARCUS_SMASH_COMBO_WINDOW_MS;
      this.combo = continuedCombo ? this.combo + 1 : 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.lastHitAt = now;

      const target = pop.config as MarcusSmashTargetConfig;
      const points = target.points * this.getComboMultiplier() * (now < this.rageUntil ? 2 : 1);
      this.score += points;
      this.message = this.getComboMessage();
      this.smashVisual(pop, `+${points}`);
      this.removePop(pop.cellIndex);
      options.onSound(this.combo === 3 || this.combo === 6 || this.combo === 10 ? "combo" : "smash-hit");
      this.emitHud();
    }

    private hitFriendly(pop: ActivePop) {
      const friendly = pop.config as MarcusSmashFriendlyConfig;
      this.score = Math.max(0, this.score - friendly.penalty);
      this.combo = 0;
      this.message = friendly.id === "pippa-scanner-beacon" ? "Pippa is judging you." : friendly.id === "kaz-cold-marker" ? "Kaz silently disapproves." : "Wrong target!";
      this.smashVisual(pop, `-${friendly.penalty}`);
      this.removePop(pop.cellIndex);
      options.onSound("miss-hit");
      this.emitHud();
    }

    private hitPowerUp(pop: ActivePop) {
      const powerUp = pop.config as MarcusSmashPowerUpConfig;
      this.message = powerUp.displayName;
      this.smashVisual(pop, powerUp.glyph);
      this.removePop(pop.cellIndex);
      this.applyPowerUp(powerUp, pop.row);
      options.onSound("powerup");
      this.emitHud();
    }

    private applyPowerUp(powerUp: MarcusSmashPowerUpConfig, row: number) {
      if (powerUp.id === "red-velocity-slam") {
        this.clearRow(row);
        options.onSound("row-clear");
        return;
      }

      if (powerUp.id === "marcus-rage") {
        this.rageUntil = this.time.now + 5000;
        return;
      }

      if (powerUp.id === "kaz-freeze") {
        this.frozenUntil = this.time.now + 3000;
        this.activePops.forEach((pop) => {
          pop.expiresAt += 3000;
        });
        return;
      }

      if (powerUp.id === "pippa-scan") {
        this.scanUntil = this.time.now + 4000;
        this.activePops.forEach((pop) => {
          if (pop.kind === "friendly") this.removePop(pop.cellIndex);
        });
        return;
      }

      if (powerUp.id === "tala-chaos-spark") {
        Array.from(this.activePops.values())
          .filter((pop) => pop.kind === "enemy")
          .slice(0, 3)
          .forEach((pop) => this.hitEnemy(pop));
      }
    }

    private clearRow(row: number) {
      Array.from(this.activePops.values())
        .filter((pop) => pop.row === row && pop.kind === "enemy")
        .forEach((pop) => this.hitEnemy(pop));
    }

    private expirePop(pop: ActivePop) {
      if (pop.kind === "enemy") {
        this.health -= 1;
        this.combo = 0;
        this.message = this.getMissMessage();
        this.projectileVisual(pop);
        options.onSound("marcus-hit");
        this.emitHud();
        if (this.health <= 0) {
          this.removePop(pop.cellIndex);
          this.finishRound(true);
          return;
        }
      }

      this.removePop(pop.cellIndex);
    }

    private smashVisual(pop: ActivePop, text: string) {
      const { x, y } = this.getCellCenter(pop.cellIndex);
      const crack = this.add.graphics();
      crack.lineStyle(4, 0xff4764, 0.78);
      crack.lineBetween(x - 42, y - 34, x + 34, y + 28);
      crack.lineBetween(x + 24, y - 38, x - 22, y + 34);
      crack.lineBetween(x - 8, y - 48, x + 8, y + 48);
      this.cracks.push(crack);
      this.time.delayedCall(520, () => {
        crack.destroy();
        this.cracks = this.cracks.filter((item) => item !== crack);
      });

      const burst = this.add.text(x, y - 42, text, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "30px",
        fontStyle: "900",
        stroke: "#ff4764",
        strokeThickness: 5
      }).setOrigin(0.5);
      this.tweens.add({
        targets: burst,
        y: y - 96,
        alpha: 0,
        scale: 1.25,
        duration: 520,
        onComplete: () => burst.destroy()
      });

      this.cameras.main.shake(80, 0.004);
      this.flashMarcus();
    }

    private projectileVisual(pop: ActivePop) {
      const { x, y } = this.getCellCenter(pop.cellIndex);
      const projectile = this.add.circle(x, y, 9, 0x5bffb5, 0.9);
      this.tweens.add({
        targets: projectile,
        x: 54,
        y: GAME_HEIGHT - 58,
        scale: 1.8,
        alpha: 0,
        duration: 360,
        onComplete: () => projectile.destroy()
      });
      this.flashMarcus();
    }

    private flashMarcus() {
      if (!this.marcusPulse) return;
      this.marcusPulse.clear();
      this.marcusPulse.lineStyle(9, 0xff4764, 0.84);
      this.marcusPulse.strokeCircle(48, GAME_HEIGHT - 58, 44);
      this.tweens.add({
        targets: this.marcusPulse,
        alpha: 0.25,
        duration: 160,
        yoyo: true
      });
    }

    private removePop(cellIndex: number) {
      const pop = this.activePops.get(cellIndex);
      if (!pop) return;
      this.activePops.delete(cellIndex);
      this.tweens.killTweensOf(pop.container);
      this.tweens.add({
        targets: pop.container,
        y: pop.container.y + 42,
        alpha: 0,
        scale: 0.3,
        duration: 120,
        onComplete: () => pop.container.destroy()
      });
    }

    private startFrenzy() {
      this.frenzy = true;
      this.message = "MARCUS FRENZY!";
      options.onSound("frenzy");
      if (this.spawnEvent) {
        this.spawnEvent.remove(false);
        this.spawnEvent = this.time.addEvent({
          delay: 260,
          loop: true,
          callback: () => this.spawnPop()
        });
      }
      this.cameras.main.flash(220, 255, 71, 100, false);
      this.emitHud();
    }

    private finishRound(endedByHealth: boolean) {
      if (this.ended) return;
      this.ended = true;
      this.spawnEvent?.remove(false);
      this.timerEvent?.remove(false);
      this.activePops.forEach((pop) => pop.container.destroy());
      this.activePops.clear();
      options.onSound("round-complete");
      options.onComplete(getMarcusSmashResult(this.score, this.bestCombo, this.health, endedByHealth));
    }

    private emitHud() {
      options.onHudUpdate({
        score: this.score,
        combo: this.combo,
        bestCombo: this.bestCombo,
        health: this.health,
        remainingSeconds: this.remainingSeconds,
        frenzy: this.frenzy,
        message: this.message
      });
    }

    private getComboMultiplier() {
      if (this.combo >= 10) return 5;
      if (this.combo >= 6) return 3;
      if (this.combo >= 3) return 2;
      return 1;
    }

    private getComboMessage() {
      if (this.combo >= 10) return "VEGAN AISLE PANIC!";
      if (this.combo >= 6) return "MARCUS MODE!";
      if (this.combo >= 3) return "DOUBLE SMASH!";
      return "SMASH!";
    }

    private getMissMessage() {
      const messages = [
        "Oat milk counterattack!",
        "Tofu survived. Unacceptable.",
        "Plant burger launched emotional damage."
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }

    private getTargetLifetime() {
      const elapsed = (this.time.now - this.roundStartedAt) / 1000;
      if (elapsed >= 25) return 500 + Math.random() * 400;
      if (elapsed >= 10) return 900 + Math.random() * 400;
      return 1200 + Math.random() * 400;
    }

    private getCellCenter(cellIndex: number) {
      const col = cellIndex % MARCUS_SMASH_GRID_COLUMNS;
      const row = Math.floor(cellIndex / MARCUS_SMASH_GRID_COLUMNS);
      return {
        x: BOARD_LEFT + col * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2,
        y: BOARD_TOP + row * (CELL_HEIGHT + CELL_GAP) + CELL_HEIGHT / 2
      };
    }
  };
}
