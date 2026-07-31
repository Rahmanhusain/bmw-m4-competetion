"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAudioStore } from "@/lib/audio-store";
import AudioSettings from "./AudioSettings";

/**
 * Sound indicator, the mixer's trigger, and the thing that satisfies the browser
 * autoplay gate.
 *
 * The arming listeners are on window rather than this button because the *first*
 * user gesture anywhere on the page should start the music — waiting for a click
 * on this specific control would mean most visitors never hear it. `once: true`
 * plus the store's idempotent `arm()` means this costs nothing after the first
 * interaction.
 *
 * Clicking opens the mixer rather than toggling mute directly. Mute now lives
 * inside the panel, next to the sliders it relates to.
 *
 * The glyph is two states, not one animated in place: equaliser bars while sound
 * is actually coming out, and a crossed-out speaker when it isn't. The bars alone
 * couldn't say "muted" — a static bar and a bar mid-animation look the same in a
 * still frame — so silence gets its own unambiguous icon.
 */
export default function AudioToggle() {
  const playing = useAudioStore((s) => s.playing);
  const muted = useAudioStore((s) => s.muted);
  const ambient = useAudioStore((s) => s.volumes.ambient);

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Dismiss on outside click or Escape. Only bound while open, so the closed
  // state adds no listeners to a page that's already doing scroll work.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      // The button is excluded too, otherwise its own click would close the
      // panel here and immediately reopen it in the onClick below.
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // "Audible right now" is the union of every way the bed can end up silent:
  // the autoplay gate never opened (or the asset failed, which leaves `playing`
  // false), it's muted, or its level is at zero. Anything but true shows muted.
  const audible = playing && !muted && ambient > 0;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          audible ? "Sound settings — sound on" : "Sound settings — sound muted"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        title={audible ? "Sound on" : "Sound muted"}
        className="audio-toggle"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.92 }}
      >
        {audible ? (
          /* Three bars, animating — the control doubles as a playback meter. */
          <span className="audio-bars" aria-hidden>
            <span className="audio-bar audio-bar-live" />
            <span className="audio-bar audio-bar-live" />
            <span className="audio-bar audio-bar-live" />
          </span>
        ) : (
          /* Speaker with a slash. strokeLinecap keeps the slash from ending in
             a hard corner against the cone at this size. */
          <svg
            className="audio-muted-icon"
            viewBox="0 0 16 16"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M8.4 2.6 4.9 5.5H2.4v5h2.5l3.5 2.9z" />
            <path d="m10.8 6.2 3.2 3.6M14 6.2l-3.2 3.6" />
          </svg>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <AudioSettings panelRef={panelRef} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
