"use client";

import { useScrollStore } from "@/lib/scroll-store";
import { goToStop, stopIndexForState, stops } from "@/lib/navigation";

/**
 * Section rail on the right edge.
 *
 * This used to be a column of purely decorative dots — they carried a `title`
 * and changed size with progress, but had `role="presentation"`, a default
 * cursor and no handler, so they read as navigation while doing nothing. They
 * are now the real thing: a labelled list of buttons that jump the scroll.
 *
 * The whole rail is one `<nav>` with a list inside rather than loose buttons, so
 * a screen reader announces "5 of 6" style position instead of six unrelated
 * controls. `aria-current` marks the active stop.
 *
 * Labels are rendered always and revealed on hover/focus with opacity+transform
 * rather than being mounted on demand: mounting text on hover causes a layout
 * pass mid-interaction, and this rail sits over a canvas that is already
 * compositing every frame.
 */
export default function ScrollProgress() {
  const activeSection = useScrollStore((s) => s.activeSection);
  const exploreMode = useScrollStore((s) => s.exploreMode);

  // Shared with the keyboard handler rather than recomputed here, so "which dot
  // is lit" and "where will an arrow key take me" can't drift apart.
  const activeIdx = stopIndexForState(activeSection, exploreMode);

  return (
    <nav className="rail" aria-label="Section navigation">
      <ol className="rail-list">
        {stops.map((stop, i) => {
          const isActive = i === activeIdx;
          return (
            <li key={stop.id} className="rail-item">
              <button
                type="button"
                onClick={() => goToStop(i)}
                className={isActive ? "rail-dot rail-dot-active" : "rail-dot"}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Go to ${stop.label}`}
              >
                {/* Label sits outside the dot's hit area visually but inside the
                    button, so hovering the text also highlights the dot. */}
                <span className="rail-label">{stop.label}</span>
                <span className="rail-tick" aria-hidden />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
