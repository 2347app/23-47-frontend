import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";
import { usePresenceStore } from "../store/presence.store";
import { useChatStore, type Message } from "../store/chat.store";
import { useEraStore } from "../store/era.store";
import { findEra } from "../themes/eras";
import { disconnectSocket, getSocket } from "../websocket/socket";
import { SFX } from "../audio/soundManager";
import toast from "react-hot-toast";

export function useSocket(): Socket | null {
  const token = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id);
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !userId) {
      disconnectSocket();
      ref.current = null;
      return;
    }
    const socket = getSocket(token);
    if (!socket) return;
    ref.current = socket;

    const presence = usePresenceStore.getState();
    const chat = useChatStore.getState();

    const onReady = () => {
      socket.emit("presence:list", null, (res: { online: string[] }) => {
        if (res?.online) presence.setOnline(res.online);
      });
    };
    const onOnline = ({ userId }: { userId: string }) => {
      presence.add(userId);
      SFX.online();
    };
    const onOffline = ({ userId }: { userId: string }) => {
      presence.remove(userId);
      SFX.offline();
    };
    const onStatus = ({ userId, status, customStatus }: { userId: string; status: string; customStatus?: string | null }) => {
      presence.setStatus(userId, status, customStatus);
    };
    const onChatNew = (msg: Message) => {
      const peerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      chat.appendMessage(peerId, msg);
      if (msg.senderId !== userId) {
        SFX.message();
      }
    };
    const onTyping = ({ from, typing }: { from: string; typing: boolean }) => {
      chat.setTyping(from, typing);
    };
    const onNudge = ({ from }: { from: string }) => {
      SFX.nudge();
      toast(`💢 ${from === userId ? "Tú" : "Alguien"} mandó un zumbido`, { icon: "📳" });
      // efecto vibracion en root
      const root = document.getElementById("root");
      if (root) {
        root.style.transition = "transform 0.05s";
        let i = 0;
        const id = setInterval(() => {
          i++;
          root.style.transform = `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 8}px)`;
          if (i > 10) {
            clearInterval(id);
            root.style.transform = "";
          }
        }, 40);
      }
    };
    const onEraChange = ({ userId: uid, era: eraId }: { userId: string; era: string }) => {
      if (uid !== userId) return;
      const era = findEra(eraId);
      if (era) useEraStore.getState().setEra(era.id);
    };

    socket.on("session:ready", onReady);
    socket.on("presence:online", onOnline);
    socket.on("presence:offline", onOffline);
    socket.on("status:update", onStatus);
    socket.on("chat:new", onChatNew);
    socket.on("chat:typing", onTyping);
    socket.on("chat:nudge", onNudge);
    socket.on("era:change", onEraChange);

    return () => {
      socket.off("session:ready", onReady);
      socket.off("presence:online", onOnline);
      socket.off("presence:offline", onOffline);
      socket.off("status:update", onStatus);
      socket.off("chat:new", onChatNew);
      socket.off("chat:typing", onTyping);
      socket.off("chat:nudge", onNudge);
      socket.off("era:change", onEraChange);
    };
  }, [token, userId]);

  return ref.current;
}
