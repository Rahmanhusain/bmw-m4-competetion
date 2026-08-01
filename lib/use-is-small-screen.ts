"use client";

import { useEffect, useState } from "react";

/**
 * True for phones and small tablets — the devices this experience is worth
 * warning about.
 *
 * Tested with `pointer: coarse` *and* a width ceiling rather than a user-agent
 * sniff: the thing that actually degrades here is a small screen driving a heavy
 * WebGL scene, not any particular vendor. A touchscreen laptop reports coarse
 * pointer on some configurations but has the width and the GPU to run this fine,
 * so the width check keeps it out of the warning.
 *
 * Evaluated in an effect rather than during render because `matchMedia` does not
 * exist on the server — reading it in the component body would break the
 * prerender.
 */
export function useIsSmallScreen(): boolean {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 820px), (pointer: coarse)");
    const update = () => setSmall(query.matches && window.innerWidth <= 1024);
    update();
    query.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return small;
}
