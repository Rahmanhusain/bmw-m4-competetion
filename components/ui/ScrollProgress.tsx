"use client";

import { useScrollStore } from "@/lib/scroll-store";
import { sections } from "@/lib/sections";

export default function ScrollProgress() {
  const activeSection = useScrollStore((s) => s.activeSection);
  const exploreMode = useScrollStore((s) => s.exploreMode);

  const items = [
    { label: "HERO", id: "hero" },
    ...sections.map((s) => ({ label: `${s.index} ${s.label}`, id: s.id })),
    { label: "EXPLORE", id: "explore" },
  ];

  const activeIdx = exploreMode ? items.length - 1 : activeSection + 1;

  return (
    <div
      style={{
        position: "fixed",
        right: "1.5rem",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {items.map((item, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={item.id}
            title={item.label}
            style={{
              width: isActive ? "8px" : "4px",
              height: isActive ? "8px" : "4px",
              borderRadius: "50%",
              background: isActive
                ? "linear-gradient(135deg, #3A6FF5, #7B3AF5)"
                : "#1C1D20",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            role="presentation"
          />
        );
      })}
    </div>
  );
}
