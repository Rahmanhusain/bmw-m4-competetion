"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a numeric stat up when its section becomes active.
 *
 * The values in `sections.ts` are authored as display strings ("503", "3.8",
 * "479") because that's what they are — copy, not measurements. So rather than
 * changing that shape, this parses the numeric prefix and preserves the original
 * decimal precision, which keeps "3.8" animating as 0.0 → 3.8 rather than
 * snapping between integers. Anything non-numeric is rendered verbatim.
 *
 * Driven by rAF against a timestamp rather than a per-frame increment: a fixed
 * step per frame runs at different speeds on 60Hz and 144Hz displays, and drifts
 * whenever a frame is late.
 */

const DURATION_MS = 1100;

/** easeOutExpo — fast start, long settle. Matches the panel's entrance feel. */
function ease(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface CountUpProps {
  /** The authored display value, e.g. "503" or "3.8". */
  value: string;
  /** Counts when this flips true; resets when it flips false. */
  active: boolean;
}

export default function CountUp({ value, active }: CountUpProps) {
  const target = Number(value);
  const numeric = Number.isFinite(target);
  // Decimal places in the source string, so "3.8" animates at one decimal and
  // "503" never renders as "502.7".
  const precision = value.includes(".") ? value.split(".")[1].length : 0;

  const [display, setDisplay] = useState(() => (numeric ? 0 : target));
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!numeric) return;

    if (!active) {
      // Reset so re-entering the section replays the count rather than showing
      // the final value immediately.
      setDisplay(0);
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplay(target);
      return;
    }

    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / DURATION_MS);
      setDisplay(target * ease(t));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [active, numeric, target]);

  if (!numeric) return <>{value}</>;

  return <>{display.toFixed(precision)}</>;
}
