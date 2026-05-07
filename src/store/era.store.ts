import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyEraToRoot, DEFAULT_ERA, ERAS, findEra, type Era } from "../themes/eras";

interface EraState {
  currentEra: Era;
  nightModeForced: boolean | null; // null = auto
  setEra: (id: string) => void;
  setNightMode: (mode: boolean | null) => void;
  isNight: () => boolean;
}

export const useEraStore = create<EraState>()(
  persist(
    (set, get) => ({
      currentEra: DEFAULT_ERA,
      nightModeForced: null,
      setEra: (id) => {
        const era = findEra(id) ?? DEFAULT_ERA;
        applyEraToRoot(era);
        set({ currentEra: era });
      },
      setNightMode: (mode) => set({ nightModeForced: mode }),
      isNight: () => {
        const forced = get().nightModeForced;
        if (forced !== null) return forced;
        const h = new Date().getHours();
        return h >= 23 || h < 6;
      },
    }),
    {
      name: "2347-era",
      partialize: (s) => ({ currentEra: s.currentEra, nightModeForced: s.nightModeForced }),
    }
  )
);

export { ERAS };
