"use client";

import { motion } from "motion/react";
import type { RefObject } from "react";
import {
  CHANNEL_META,
  channelFloor,
  useAudioStore,
  type AudioChannel,
} from "@/lib/audio-store";

/**
 * The mixer that drops out of the header's sound indicator.
 *
 * Three sliders, one per channel, plus a mute for the ambient bed. Mute is
 * ambient-only by design, and the cue sliders bottom out at their channel floor
 * rather than at zero — the cues are feedback for something the visitor just did,
 * so they can be trimmed quiet but not switched off. The floor is enforced in the
 * store too; setting it as the input's `min` is what stops the thumb from moving
 * somewhere the store would only snap it back from.
 *
 * Moving a cue slider previews it on release rather than on every input event:
 * a drag fires input dozens of times, and the store's own rate limiter would
 * swallow most of them anyway. Ambient needs no preview — it's already playing,
 * so the change is audible as you drag.
 */

interface AudioSettingsProps {
  /** Held by AudioToggle so its outside-click handler can ignore this subtree. */
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export default function AudioSettings({ panelRef, onClose }: AudioSettingsProps) {
  const volumes = useAudioStore((s) => s.volumes);
  const muted = useAudioStore((s) => s.muted);
  const armed = useAudioStore((s) => s.armed);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const setVolume = useAudioStore((s) => s.setVolume);
  const resetVolumes = useAudioStore((s) => s.resetVolumes);

  const preview = (channel: AudioChannel) => {
    if (channel === "ambient") return;
    useAudioStore.getState().playSfx(channel);
  };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Sound settings"
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.16 } }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="audio-panel"
    >
      <div className="audio-panel-head">
        <span className="gradient-text-static audio-panel-title">SOUND</span>
        <button
          type="button"
          onClick={resetVolumes}
          className="audio-panel-reset"
          title="Restore default levels"
        >
          RESET
        </button>
      </div>

      {CHANNEL_META.map(({ id, label, hint }) => {
        // The ambient row reads as inactive while muted, but stays operable —
        // setting a level before unmuting is reasonable.
        const dimmed = id === "ambient" && muted;

        const min = Math.round(channelFloor(id) * 100);
        const value = Math.round(volumes[id] * 100);
        // The thumb sits at the left edge when value === min, so the fill has to
        // be measured across the usable range rather than from zero — otherwise
        // a cue parked at its floor would still paint 8% of track.
        const fill = ((value - min) / (100 - min)) * 100;

        return (
          <div key={id} className="audio-row" style={{ opacity: dimmed ? 0.45 : 1 }}>
            <div className="audio-row-head">
              <span className="audio-row-label">{label}</span>
              <span className="audio-row-value">{value}</span>
            </div>

            <input
              type="range"
              min={min}
              max={100}
              step={1}
              value={value}
              aria-label={`${label} volume`}
              onChange={(e) => setVolume(id, Number(e.target.value) / 100)}
              onPointerUp={() => preview(id)}
              onKeyUp={() => preview(id)}
              className="audio-range"
              /* The filled portion of the track is drawn from this, so the
                 gradient stops exactly at the thumb. */
              style={{ ["--fill" as string]: `${fill}%` }}
            />

            <span className="audio-row-hint">{hint}</span>
          </div>
        );
      })}

      <button
        type="button"
        onClick={toggleMuted}
        aria-pressed={muted}
        className="audio-mute-row"
      >
        <span className="audio-mute-label">
          {muted ? "AMBIENT MUTED" : "MUTE AMBIENT"}
        </span>
        <span className={muted ? "audio-switch audio-switch-on" : "audio-switch"}>
          <span className="audio-switch-knob" />
        </span>
      </button>

      {/* Until the browser has seen a gesture the bed genuinely isn't playing,
          so say so rather than showing a mix that isn't audible yet. */}
      {!armed && (
        <p className="audio-panel-note">Ambient starts after your first click.</p>
      )}
    </motion.div>
  );
}
