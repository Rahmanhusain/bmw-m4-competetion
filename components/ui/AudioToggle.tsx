"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { useAudioStore } from "@/lib/audio-store";

/**
 * Mute control, and the thing that satisfies the browser autoplay gate.
 *
 * The listeners are on window rather than this button because the *first* user
 * gesture anywhere on the page should start the music — waiting for a click on
 * this specific control would mean most visitors never hear it. `once: true`
 * plus the store's idempotent `arm()` means this costs nothing after the first
 * interaction.
 */
export default function AudioToggle() {
  const armed = useAudioStore((s) => s.armed);
  const muted = useAudioStore((s) => s.muted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);

  useEffect(() => {
    // Read `arm` off the store directly instead of subscribing: this effect runs
    // once and never needs to re-run when other audio state changes.
    const arm = useAudioStore.getState().arm;
    const onGesture = () => arm();

    // pointerdown and keydown both count as activating gestures; wheel/scroll
    // does not, which is why scrolling alone won't start playback.
    window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
    window.addEventListener("keydown", onGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  const showOn = armed && !muted;

  return (
    <motion.button
      type="button"
      onClick={toggleMuted}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      aria-pressed={!muted}
      title={muted ? "Unmute" : "Mute"}
      className="audio-toggle"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Three bars that animate only while audio is actually audible, so the
          control doubles as a playback indicator. */}
      <span className="audio-bars" aria-hidden>
        <span className={showOn ? "audio-bar audio-bar-live" : "audio-bar"} />
        <span className={showOn ? "audio-bar audio-bar-live" : "audio-bar"} />
        <span className={showOn ? "audio-bar audio-bar-live" : "audio-bar"} />
      </span>
    </motion.button>
  );
}
