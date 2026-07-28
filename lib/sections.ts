export interface Section {
  id: string;
  index: string;
  label: string;
  headline: string;
  body: string;
  alignment: "left" | "right";
  stats?: { value: string; unit: string; label: string }[];
}

export const sections: Section[] = [
  {
    id: "exterior",
    index: "01",
    label: "EXTERIOR",
    headline: "Sculpted aggression",
    body: "Every surface shaped by function — the kidney grille sized for the S58 twin-turbo's appetite, the hood power dome channeling airflow over a 503 hp inline-six.",
    alignment: "left",
  },
  {
    id: "performance",
    index: "02",
    label: "PERFORMANCE",
    headline: "Straight-six, no compromise",
    body: "The S58 delivers linear, relentless thrust. Twin-scroll turbos eliminate lag; forged internals sustain 7,200 rpm all day.",
    alignment: "right",
    stats: [
      { value: "503", unit: "hp", label: "Peak power" },
      { value: "3.8", unit: "s", label: "0–60 mph" },
      { value: "479", unit: "lb-ft", label: "Torque" },
    ],
  },
  {
    id: "interior",
    index: "03",
    label: "INTERIOR",
    headline: "Driver-first cockpit",
    body: "Carbon-fibre bucket seats, a thick M steering wheel, and an instrument cluster that strips information down to what matters at speed.",
    alignment: "left",
  },
  {
    id: "details",
    index: "04",
    label: "DETAILS",
    headline: "Obsessive refinement",
    body: "Forged 19/20-inch wheels, carbon-fibre roof panel, quad exhaust tips — each detail earned through engineering, not decoration.",
    alignment: "right",
  },
];
