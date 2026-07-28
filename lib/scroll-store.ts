import { create } from "zustand";

interface ScrollStore {
  /** 0 → 1 overall scroll progress through the pinned camera sequence */
  progress: number;
  setProgress: (p: number) => void;

  /** Index of the currently active section (0-based), -1 = hero */
  activeSection: number;
  setActiveSection: (i: number) => void;

  /** True when user reaches the "Explore" zone and gets free orbit control */
  exploreMode: boolean;
  setExploreMode: (v: boolean) => void;

  /** True while the GLB + HDRI are still loading */
  loading: boolean;
  setLoading: (v: boolean) => void;

  /** 0 → 1 load progress for the loading screen */
  loadProgress: number;
  setLoadProgress: (p: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),

  activeSection: -1,
  setActiveSection: (activeSection) => set({ activeSection }),

  exploreMode: false,
  setExploreMode: (exploreMode) => set({ exploreMode }),

  loading: true,
  setLoading: (loading) => set({ loading }),

  loadProgress: 0,
  setLoadProgress: (loadProgress) => set({ loadProgress }),
}));
