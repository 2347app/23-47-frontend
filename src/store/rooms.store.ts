import { create } from "zustand";

export interface RoomMember {
  userId: string;
  username: string;
}

export interface ActivityItem {
  id: string;
  type: "join" | "leave";
  userId: string;
  username: string;
  slug: string;
  at: number;
}

interface RoomsState {
  activeSlug: string | null;
  members: Record<string, RoomMember[]>;
  activity: ActivityItem[];
  join: (slug: string) => void;
  leave: () => void;
  setMembers: (slug: string, list: RoomMember[]) => void;
  onPresence: (e: { type: "join" | "leave"; userId: string; username: string; slug: string }) => void;
  totalOnline: () => number;
}

export const useRoomsStore = create<RoomsState>((set, get) => ({
  activeSlug: null,
  members: {},
  activity: [],

  join: (slug) => set({ activeSlug: slug }),
  leave: () => set({ activeSlug: null }),

  setMembers: (slug, list) =>
    set({ members: { ...get().members, [slug]: list } }),

  onPresence: ({ type, userId, username, slug }) => {
    const m = { ...get().members };
    if (type === "join") {
      const prev = m[slug] ?? [];
      if (!prev.some((p) => p.userId === userId))
        m[slug] = [...prev, { userId, username }];
    } else {
      m[slug] = (m[slug] ?? []).filter((p) => p.userId !== userId);
    }
    const item: ActivityItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type, userId, username, slug, at: Date.now(),
    };
    set({ members: m, activity: [...get().activity.slice(-29), item] });
  },

  totalOnline: () =>
    Object.values(get().members).reduce((a, list) => a + list.length, 0),
}));
