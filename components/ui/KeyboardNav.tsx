"use client";

import { useEffect } from "react";
import { useScrollStore } from "@/lib/scroll-store";
import { goToStop, stopIndexForState, stops } from "@/lib/navigation";

/**
 * Keyboard control for the whole showcase. Renders nothing.
 *
 * The page is driven entirely by window scroll, so arrow keys already scrolled
 * it a little — but 600vh of track means a keypress moved the camera an
 * imperceptible amount, and there was no way to reach a specific section. These
 * bindings move stop to stop instead.
 *
 * Modelled on AudioCues: a listener-only component with no render output, so
 * nothing here can re-render the page tree. State is read with `getState()` at
 * keypress time rather than through selectors, so this never re-subscribes as
 * progress ticks.
 *
 * Deliberately does not preventDefault for keys it doesn't own, and bails
 * entirely when focus is inside a control — otherwise arrow keys would stop
 * working on the mixer's volume sliders and Escape would fight the panel.
 */

/** Elements that own every key, so we stay out of the way entirely. */
const TEXT_ENTRY = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** Keys that activate a focused button, which must not be hijacked. */
const ACTIVATION_KEYS = new Set([" ", "Enter"]);

export default function KeyboardNav() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Let modified chords through to the browser (Cmd+ArrowDown etc.).
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        // Sliders and text fields own every key they receive.
        if (TEXT_ENTRY.has(target.tagName)) return;
        if (target.isContentEditable) return;
        // A focused button keeps Space/Enter — otherwise clicking a rail dot
        // would leave focus on it and Space would scroll instead of re-pressing
        // it. Arrows and Home/End are still ours, so the rail stays keyboard
        // navigable while focus sits inside it.
        if (target.tagName === "BUTTON" && ACTIVATION_KEYS.has(e.key)) return;
      }

      const state = useScrollStore.getState();
      if (state.loading) return;

      const current = stopIndexForState(state.activeSection, state.exploreMode);

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          goToStop(Math.min(current + 1, stops.length - 1));
          break;

        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToStop(Math.max(current - 1, 0));
          break;

        case "Home":
          e.preventDefault();
          goToStop(0);
          break;

        case "End":
          e.preventDefault();
          goToStop(stops.length - 1);
          break;

        default: {
          // Number keys jump straight to a section: 1-4 are the content stops,
          // which is the mapping the rail's visible "01"-"04" labels imply.
          const digit = Number(e.key);
          if (Number.isInteger(digit) && digit >= 1 && digit <= stops.length) {
            e.preventDefault();
            goToStop(digit);
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
