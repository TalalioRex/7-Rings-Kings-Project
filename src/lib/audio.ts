import { Howl } from "howler";

export type GameSoundId =
  | "buttonClick"
  | "spinStart"
  | "reelStop"
  | "normalWin"
  | "bigWin"
  | "jackpotWin"
  | "scatterTrigger"
  | "freeSpinsStart"
  | "characterSelect"
  | "error";

const SOUND_FILES: Record<GameSoundId, string> = {
  buttonClick: "/assets/audio/button-click.mp3",
  spinStart: "/assets/audio/spin-start.mp3",
  reelStop: "/assets/audio/reel-stop.mp3",
  normalWin: "/assets/audio/normal-win.mp3",
  bigWin: "/assets/audio/big-win.mp3",
  jackpotWin: "/assets/audio/jackpot-win.mp3",
  scatterTrigger: "/assets/audio/scatter-trigger.mp3",
  freeSpinsStart: "/assets/audio/free-spins-start.mp3",
  characterSelect: "/assets/audio/character-select.mp3",
  error: "/assets/audio/error.mp3"
};

const soundCache = new Map<GameSoundId, Howl | null>();
const loadedSoundIds = new Set<GameSoundId>();
let fallbackAudioContext: AudioContext | null = null;

function getSound(soundId: GameSoundId): Howl | null {
  if (typeof window === "undefined") return null;
  if (soundCache.has(soundId)) {
    return soundCache.get(soundId) ?? null;
  }

  const howl = new Howl({
    src: [SOUND_FILES[soundId]],
    html5: false,
    preload: true,
    volume: soundId === "jackpotWin" ? 0.85 : 0.58,
    onload: () => {
      loadedSoundIds.add(soundId);
    },
    onloaderror: () => {
      soundCache.set(soundId, null);
    },
    onplayerror: () => {
      soundCache.set(soundId, null);
    }
  });

  soundCache.set(soundId, howl);
  return howl;
}

function playSound(soundId: GameSoundId, enabled: boolean) {
  if (!enabled) return;
  try {
    const sound = getSound(soundId);
    if (sound && loadedSoundIds.has(soundId)) {
      sound.play();
      return;
    }

    playFallbackSound(soundId);
  } catch {
    soundCache.set(soundId, null);
    playFallbackSound(soundId);
  }
}

function getFallbackAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextConstructor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  fallbackAudioContext ??= new AudioContextConstructor();
  if (fallbackAudioContext.state === "suspended") {
    void fallbackAudioContext.resume();
  }

  return fallbackAudioContext;
}

function playFallbackSound(soundId: GameSoundId) {
  const context = getFallbackAudioContext();
  if (!context) return;

  switch (soundId) {
    case "buttonClick":
      playTone(context, 520, 0.04, "square", 0.08);
      break;
    case "characterSelect":
      playArp(context, [440, 660, 880], 0.055, 0.08);
      break;
    case "spinStart":
      playSpinSweep(context);
      break;
    case "reelStop":
      playTone(context, 180, 0.055, "triangle", 0.12);
      playNoise(context, 0.05, 0.05);
      break;
    case "normalWin":
      playArp(context, [523, 659, 784], 0.08, 0.11);
      break;
    case "bigWin":
      playArp(context, [392, 523, 659, 784, 1046], 0.09, 0.13);
      break;
    case "jackpotWin":
      playArp(context, [523, 659, 784, 1046, 1318, 1568], 0.11, 0.16);
      window.setTimeout(() => playNoise(context, 0.22, 0.08), 80);
      break;
    case "scatterTrigger":
      playArp(context, [330, 494, 740], 0.08, 0.1);
      break;
    case "freeSpinsStart":
      playArp(context, [294, 440, 587, 880], 0.09, 0.12);
      break;
    case "error":
      playArp(context, [220, 164], 0.11, 0.11);
      break;
  }
}

function playTone(
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0
) {
  const startedAt = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startedAt);
  gain.gain.setValueAtTime(0.0001, startedAt);
  gain.gain.exponentialRampToValueAtTime(volume, startedAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startedAt);
  oscillator.stop(startedAt + duration + 0.02);
}

function playArp(context: AudioContext, notes: number[], step: number, volume: number) {
  notes.forEach((note, index) => {
    playTone(context, note, step * 1.15, "triangle", volume, index * step);
  });
}

function playSpinSweep(context: AudioContext) {
  playNoise(context, 0.42, 0.055);

  const startedAt = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(110, startedAt);
  oscillator.frequency.exponentialRampToValueAtTime(44, startedAt + 0.46);
  gain.gain.setValueAtTime(0.0001, startedAt);
  gain.gain.exponentialRampToValueAtTime(0.08, startedAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.46);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startedAt);
  oscillator.stop(startedAt + 0.5);
}

function playNoise(context: AudioContext, duration: number, volume: number) {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
  }

  const source = context.createBufferSource();
  const gain = context.createGain();
  const startedAt = context.currentTime;

  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, startedAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);
  source.connect(gain);
  gain.connect(context.destination);
  source.start(startedAt);
  source.stop(startedAt + duration);
}

export const MISSING_AUDIO_FILES = Object.values(SOUND_FILES);

export function playButtonClick(enabled: boolean) {
  playSound("buttonClick", enabled);
}

export function playSpinStart(enabled: boolean) {
  playSound("spinStart", enabled);
}

export function playReelStop(enabled: boolean) {
  playSound("reelStop", enabled);
}

export function playNormalWin(enabled: boolean) {
  playSound("normalWin", enabled);
}

export function playBigWin(enabled: boolean) {
  playSound("bigWin", enabled);
}

export function playJackpotWin(enabled: boolean) {
  playSound("jackpotWin", enabled);
}

export function playScatterTrigger(enabled: boolean) {
  playSound("scatterTrigger", enabled);
}

export function playFreeSpinsStart(enabled: boolean) {
  playSound("freeSpinsStart", enabled);
}

export function playCharacterSelect(enabled: boolean) {
  playSound("characterSelect", enabled);
}

export function playError(enabled: boolean) {
  playSound("error", enabled);
}

export function playMiniGameStart(enabled: boolean) {
  playSound("spinStart", enabled);
}

export function playMiniGameTargetSpawn(enabled: boolean) {
  playSound("characterSelect", enabled);
}

export function playMiniGameTargetSmash(enabled: boolean) {
  playSound("reelStop", enabled);
}

export function playMiniGameCombo(enabled: boolean) {
  playSound("bigWin", enabled);
}

export function playMiniGameTimerWarning(enabled: boolean) {
  playSound("scatterTrigger", enabled);
}

export function playMiniGameRoundComplete(enabled: boolean) {
  playSound("freeSpinsStart", enabled);
}

export function playMiniGameRewardClaim(enabled: boolean) {
  playSound("buttonClick", enabled);
}

export function playTalaLaneMove(enabled: boolean) {
  playSound("buttonClick", enabled);
}

export function playTalaSparkPickup(enabled: boolean) {
  playSound("normalWin", enabled);
}

export function playTalaPowerUp(enabled: boolean) {
  playSound("bigWin", enabled);
}

export function playPippaScannerPulse(enabled: boolean) {
  playSound("buttonClick", enabled);
}

export function playPippaCorrectSignal(enabled: boolean) {
  playSound("normalWin", enabled);
}

export function playPippaSpecialDetected(enabled: boolean) {
  playSound("bigWin", enabled);
}

export function playKazStep(enabled: boolean) {
  playSound("buttonClick", enabled);
}

export function playKazMistWave(enabled: boolean) {
  playSound("spinStart", enabled);
}

export function playKazOrbPickup(enabled: boolean) {
  playSound("normalWin", enabled);
}

export function playKazSilentSlash(enabled: boolean) {
  playSound("reelStop", enabled);
}

export function playKazHit(enabled: boolean) {
  playSound("error", enabled);
}
