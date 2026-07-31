import { create } from "zustand";

/**
 * Audio layer for the experience.
 *
 * Four things make this more than a wrapper around `new Audio()`:
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
 *
 * 4. **Three independent channels.** Ambient, transition and camera-move each
 *    carry their own gain, persisted across visits. Ambient is the only one that
 *    can be silenced — it's the continuous bed people want gone while they work.
 *    The cues are permanent: they're feedback for something the visitor just did,
 *    so they can be trimmed down to MIN_GAIN but never taken to zero, and mute
 *    doesn't touch them at all.
 */

const MUTE_KEY = "bmw-m4-audio-muted";
const VOLUME_KEY = "bmw-m4-audio-volumes";

export const MUSIC_SRC = "/audio/ambient.mp3";
export const SFX = {
  transition: "/audio/transition.wav",
  camera: "/audio/camera-move.wav",
} as const;

export type SfxName = keyof typeof SFX;
/** Every independently mixable channel. The SFX names are a subset. */
export type AudioChannel = "ambient" | SfxName;

export type Volumes = Record<AudioChannel, number>;

/**
 * Quietest a cue channel is allowed to get. The cues are permanent, so their
 * sliders trim rather than switch off — this is the bottom of that trim range,
 * low enough to be unobtrusive but still plainly audible.
 */
export const SFX_MIN_GAIN = 0.08;

/** The floor for a channel. Only ambient is allowed all the way to silence. */
export function channelFloor(channel: AudioChannel): number {
  return channel === "ambient" ? 0 : SFX_MIN_GAIN;
}

/**
 * Clamp a requested gain into the range its channel permits. Every write to a
 * level goes through here — the store, restored localStorage, and playback —
 * so there is one place that decides a cue can't be silenced.
 */
function clampGain(channel: AudioChannel, value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUMES[channel];
  return Math.min(1, Math.max(channelFloor(channel), value));
}

/**
 * Starting mix. Ambient sits low on purpose — it plays continuously behind
 * everything, so it should register as atmosphere rather than as content. The
 * slider goes to 1.0 for anyone who wants it louder.
 *
 * The cue levels are tuned by ear against the actual assets in `public/audio/`;
 * they're louder than ambient because they're brief and carry information.
 */
export const DEFAULT_VOLUMES: Volumes = {
  ambient: 0.25,
  transition: 0.50,
  camera: 0.30,
};

/** Order the mixer renders its rows in, with the copy for each. */
export const CHANNEL_META: { id: AudioChannel; label: string; hint: string }[] = [
  { id: "ambient", label: "AMBIENT", hint: "Background music bed" },
  { id: "transition", label: "TRANSITION", hint: "Section changes — always on" },
  { id: "camera", label: "CAMERA MOVE", hint: "Camera keyframes — always on" },
];

/** How many clones per effect. Enough for overlap, small enough to be free. */
const POOL_SIZE = 3;

/** Guard against a burst of section changes machine-gunning the same sample. */
const SFX_MIN_INTERVAL_MS = 90;

/** Length of the intro fade on the ambient bed. */
const FADE_MS = 2200;

type Pool = { nodes: HTMLAudioElement[]; next: number; lastPlayed: number };

/** Module-scope, not store state: these are imperative handles, never rendered. */
let musicEl: HTMLAudioElement | null = null;
const pools = new Map<SfxName, Pool>();

/**
 * Progress of the intro fade, 0→1. Kept separate from the channel gain so the
 * two compose: dragging the ambient slider mid-fade sets the target the fade is
 * climbing toward instead of fighting it for the remainder of the ramp.
 */
let musicFade = 0;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function applyMusicVolume(gain: number) {
  if (musicEl) musicEl.volume = clamp01(gain) * musicFade;
}

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

function readStoredVolumes(): Volumes {
  if (typeof window === "undefined") return { ...DEFAULT_VOLUMES };
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (!raw) return { ...DEFAULT_VOLUMES };
    // Merged key by key rather than trusted wholesale: a blob written by an
    // older build (or hand-edited) should contribute what it can and fall back
    // to the default for anything missing or nonsensical.
    const parsed = JSON.parse(raw) as Partial<Record<AudioChannel, unknown>>;
    const out = { ...DEFAULT_VOLUMES };
    for (const key of Object.keys(out) as AudioChannel[]) {
      const value = parsed[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        // Clamped per channel, so a zero persisted by an older build — back
        // when a cue could be switched off — is lifted to that cue's floor
        // rather than restoring a silence we no longer allow.
        out[key] = clampGain(key, value);
      }
    }
    return out;
  } catch {
    return { ...DEFAULT_VOLUMES };
  }
}

function persistVolumes(volumes: Volumes) {
  try {
    window.localStorage.setItem(VOLUME_KEY, JSON.stringify(volumes));
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
  /** Ambient-only. SFX are silenced by their own channel gain, not by this. */
  muted: boolean;
  /** True when the music element actually reached a playing state. */
  playing: boolean;
  volumes: Volumes;

  /** Called from the first user gesture. Idempotent. */
  arm: () => void;
  toggleMuted: () => void;
  setVolume: (channel: AudioChannel, value: number) => void;
  resetVolumes: () => void;
  playSfx: (name: SfxName) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  armed: false,
  muted: readStoredMute(),
  playing: false,
  volumes: readStoredVolumes(),

  arm: () => {
    if (get().armed) return;
    set({ armed: true });

    if (typeof window === "undefined") return;

    musicEl = new Audio(MUSIC_SRC);
    musicEl.loop = true;
    musicEl.preload = "auto";
    musicEl.muted = get().muted;
    // Start silent and ramp: a loop that snaps in at full volume is jarring.
    musicFade = 0;
    musicEl.volume = 0;

    musicEl
      .play()
      .then(() => {
        set({ playing: true });
        const startedAt = performance.now();
        const ramp = () => {
          if (!musicEl) return;
          musicFade = Math.min(1, (performance.now() - startedAt) / FADE_MS);
          // Re-read the gain every frame so a mid-fade slider drag is honoured.
          applyMusicVolume(get().volumes.ambient);
          if (musicFade < 1) requestAnimationFrame(ramp);
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
    // Ambient only. The SFX pools are deliberately left alone — see the note at
    // the top of this file.
    if (musicEl) musicEl.muted = muted;
  },

  setVolume: (channel, value) => {
    // Per-channel clamp, not clamp01: this is the write path the sliders use, so
    // it's where a cue's floor has to be enforced. A UI that asks for zero on a
    // permanent channel gets that channel's minimum instead.
    const gain = clampGain(channel, value);
    if (get().volumes[channel] === gain) return;

    const volumes = { ...get().volumes, [channel]: gain };
    set({ volumes });
    persistVolumes(volumes);

    // Ambient is a single long-lived element, so it changes under the listener
    // immediately. SFX gain is stamped onto the pooled node at play time
    // instead, which keeps a clip that's already mid-flight at the level it
    // started on rather than jumping partway through.
    if (channel === "ambient") applyMusicVolume(gain);
  },

  resetVolumes: () => {
    const volumes = { ...DEFAULT_VOLUMES };
    set({ volumes });
    persistVolumes(volumes);
    applyMusicVolume(volumes.ambient);
  },

  playSfx: (name) => {
    const { armed, volumes } = get();
    if (!armed || typeof window === "undefined") return;

    // A channel at zero is off. Bailing here rather than playing at volume 0
    // avoids waking the decoder for something nobody can hear.
    const gain = volumes[name];
    if (gain <= 0) return;

    const pool = getPool(name);
    const now = performance.now();
    if (now - pool.lastPlayed < SFX_MIN_INTERVAL_MS) return;
    pool.lastPlayed = now;

    const node = pool.nodes[pool.next];
    pool.next = (pool.next + 1) % POOL_SIZE;
    node.volume = gain;
    // Rewind in case this clone is still mid-playback from an earlier hit.
    node.currentTime = 0;
    node.play().catch(() => {
      /* missing asset — silent */
    });
  },
}));
