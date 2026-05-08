import { create } from "zustand";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "nudge" | "spotify";
  createdAt: string;
  deletedAt?: string | null;
  receiverId?: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

interface ChatState {
  conversations: Record<string, Message[]>; // peerId -> messages
  typing: Record<string, boolean>;
  activePeerId: string | null;
  setActivePeer: (id: string | null) => void;
  setMessages: (peerId: string, msgs: Message[]) => void;
  appendMessage: (peerId: string, msg: Message) => void;
  setTyping: (peerId: string, typing: boolean) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {},
  typing: {},
  activePeerId: null,
  setActivePeer: (id) => set({ activePeerId: id }),
  setMessages: (peerId, msgs) =>
    set({ conversations: { ...get().conversations, [peerId]: msgs } }),
  appendMessage: (peerId, msg) => {
    const list = get().conversations[peerId] ?? [];
    if (list.some((m) => m.id === msg.id)) return;
    set({ conversations: { ...get().conversations, [peerId]: [...list, msg] } });
  },
  setTyping: (peerId, typing) =>
    set({ typing: { ...get().typing, [peerId]: typing } }),
  clear: () => set({ conversations: {}, typing: {}, activePeerId: null }),
}));
