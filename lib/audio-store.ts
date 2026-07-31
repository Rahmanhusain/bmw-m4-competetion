import { create } from "zustand";

/**
 * Audio layer for the experience.
 *
 * Three things make this more than a wrapper around `new Audio()`:
 *
 * 1. **Autoplay policy.** Browsers refuse programmatic playback until the page
 *    has seen a real user gesture. Scroll does *not* count as one in Chrome. So
 *    playback is "armed" by the first pointerdown/keydown and only then starts.
 *
 * 2. **Missing files are normal.** The repo ships without audio assets, so every
 *    load failure is swallowed deliberately: no music means no music, not a
 *    console full of errors on every scroll tick.
 *
 * 3. **SFX pooling.** Section changes can fire in quick succession. Allocating a
 *    fresh HTMLAudioElement per hit leaks decoded buffers, so each effect keeps
 *    a small ring of preloaded clones and rotates through them — that also lets
 *    two hits overlap instead of one cutting the other off.
 */

const MUTE_KEY = "bmw-m4-audio-muted";

export const MUSIC_SRC = "/audio/ambient.mp3";
export const SFX = {
  transition: "/audio/transition.wav",
  camera: "/audio/camera-move.mp3",
} as const;

export type SfxName = keyof typeof SFX;

/** How many clones per effect. Enough for overlap, small enough to be free. */
const POOL_SIZE = 3;

const MUSIC_VOLUME = 0.25;
const SFX_VOLUME = 0.22;

/** Guard against a burst of section changes machine-gunning the same sample. */
const SFX_MIN_INTERVAL_MS = 90;

type Pool = { nodes: HTMLAudioElement[]; next: number; lastPlayed: number };

/** Module-scope, not store state: these are imperative handles, never rendered. */
let musicEl: HTMLAudioElement | null = null;
const pools = new Map<SfxName, Pool>();

function readStoredMute(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    // Private mode / blocked storage — default to audible.
    return false;
  }
}

function persistMute(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* non-fatal */
  }
}

function getPool(name: SfxName): Pool {
  let pool = pools.get(name);
  if (!pool) {
    const nodes = Array.from({ length: POOL_SIZE }, () => {
      const el = new Audio(SFX[name]);
      el.preload = "auto";
      el.volume = SFX_VOLUME;
      return el;
    });
    pool = { nodes, next: 0, lastPlayed: 0 };
    pools.set(name, pool);
  }
  return pool;
}

interface AudioStore {
  /** True once a real user gesture has unlocked playback. */
  armed: boolean;
  muted: boolean;
  /** True when the music element actually reached a playing state. */
  playing: boolean;

  /** Called from the first user gesture. Idempotent. */
  arm: () => void;
  toggleMuted: () => void;
  playSfx: (name: SfxName) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  armed: false,
  muted: readStoredMute(),
  playing: false,

  arm: () => {
    if (get().armed) return;
    set({ armed: true });

    if (typeof window === "undefined") return;

    musicEl = new Audio(MUSIC_SRC);
    musicEl.loop = true;
    musicEl.preload = "auto";
    musicEl.muted = get().muted;
    // Start silent and ramp: a loop that snaps in at full volume is jarring.
    musicEl.volume = 0;

    musicEl
      .play()
      .then(() => {
        set({ playing: true });
        const target = MUSIC_VOLUME;
        const startedAt = performance.now();
        const FADE_MS = 2200;
        const ramp = () => {
          if (!musicEl) return;
          const t = Math.min(1, (performance.now() - startedAt) / FADE_MS);
          musicEl.volume = target * t;
          if (t < 1) requestAnimationFrame(ramp);
        };
        requestAnimationFrame(ramp);
      })
      .catch(() => {
        // No asset, or the gesture wasn't accepted. Stay silent.
        set({ playing: false });
      });
  },

  toggleMuted: () => {
    const muted = !get().muted;
    set({ muted });
    persistMute(muted);
    if (musicEl) musicEl.muted = muted;
    for (const pool of pools.values()) {
      for (const node of pool.nodes) node.muted = muted;
    }
  },

  playSfx: (name) => {
    const { armed, muted } = get();
    if (!armed || muted || typeof window === "undefined") return;

    const pool = getPool(name);
    const now = performance.now();
    if (now - pool.lastPlayed < SFX_MIN_INTERVAL_MS) return;
    pool.lastPlayed = now;

    const node = pool.nodes[pool.next];
    pool.next = (pool.next + 1) % POOL_SIZE;
    node.muted = muted;
    // Rewind in case this clone is still mid-playback from an earlier hit.
    node.currentTime = 0;
    node.play().catch(() => {
      /* missing asset — silent */
    });
  },
}));
