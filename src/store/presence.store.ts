import { create } from "zustand";

export interface PresenceState {
  online: Set<string>;
  statuses: Record<string, { status: string; customStatus?: string | null }>;
  setOnline: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  setStatus: (userId: string, status: string, customStatus?: string | null) => void;
  isOnline: (id: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  online: new Set(),
  statuses: {},
  setOnline: (ids) => set({ online: new Set(ids) }),
  add: (id) => {
    const next = new Set(get().online);
    next.add(id);
    set({ online: next });
  },
  remove: (id) => {
    const next = new Set(get().online);
    next.delete(id);
    set({ online: next });
  },
  setStatus: (userId, status, customStatus) =>
    set({
      statuses: {
        ...get().statuses,
        [userId]: { status, customStatus: customStatus ?? null },
      },
    }),
  isOnline: (id) => get().online.has(id),
}));
