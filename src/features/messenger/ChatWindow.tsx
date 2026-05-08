import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Bell, Send, Smile, Sparkles, Zap } from "lucide-react";
import { Avatar } from "../../components/Avatar";
import { GlassCard } from "../../components/GlassCard";
import { api } from "../../services/api";
import { useChatStore, type Message } from "../../store/chat.store";
import { useAuthStore } from "../../store/auth.store";
import { usePresenceStore } from "../../store/presence.store";
import { getSocket } from "../../websocket/socket";
import { messageBubble } from "../../animations/variants";
import { SFX } from "../../audio/soundManager";

interface PeerProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  currentMood?: string | null;
  status?: {
    status: string;
    customStatus?: string | null;
    spotifyTrack?: string | null;
    spotifyArtist?: string | null;
  } | null;
}

const QUICK_EMOJIS = ["🌙", "✨", "🎵", "💌", "🌧️", "🕹️", "📼", "💿"];
const STATUS_OPTIONS = [
  { v: "online", l: "🟢 conectado" },
  { v: "away", l: "🌙 ausente" },
  { v: "dnd", l: "🎧 escuchando música" },
  { v: "invisible", l: "👻 invisible" },
];

export function ChatWindow({ peerId }: { peerId: string }) {
  const me = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [peer, setPeer] = useState<PeerProfile | null>(null);
  const [text, setText] = useState("");
  const messages = useChatStore((s) => s.conversations[peerId] ?? []);
  const setMessages = useChatStore((s) => s.setMessages);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const isTyping = useChatStore((s) => s.typing[peerId]);
  const presence = usePresenceStore((s) => s.online);
  const isOnline = presence.has(peerId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);

  // Fetch profile + history
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: u }, { data: m }] = await Promise.all([
        api.get(`/users/${peerId}`),
        api.get(`/messages/${peerId}?limit=200`),
      ]);
      if (!alive) return;
      setPeer(u.user);
      setMessages(peerId, m.messages);
      getSocket(accessToken);
    })();
    return () => {
      alive = false;
    };
  }, [peerId, setMessages, accessToken]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    const socket = getSocket(accessToken);
    SFX.send();
    socket?.emit(
      "chat:send",
      { receiverId: peerId, content: value, messageType: "text" },
      (res: { ok: boolean; message?: Message }) => {
        if (!res?.ok) {
          // fallback REST
          api.post("/messages", { receiverId: peerId, content: value, messageType: "text" }).then((r) => {
            appendMessage(peerId, r.data.message);
          });
        }
      }
    );
  };

  const onTyping = (v: string) => {
    setText(v);
    const socket = getSocket(accessToken);
    socket?.emit("chat:typing", { receiverId: peerId, typing: true });
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      socket?.emit("chat:typing", { receiverId: peerId, typing: false });
    }, 1500);
  };

  const sendNudge = () => {
    SFX.nudge();
    const socket = getSocket(accessToken);
    socket?.emit("chat:nudge", { receiverId: peerId });
    appendMessage(peerId, {
      id: `local-${Date.now()}`,
      conversationId: "",
      senderId: me!.id,
      content: "💢 has enviado un zumbido",
      messageType: "nudge",
      createdAt: new Date().toISOString(),
    });
  };

  const updateStatus = (v: string) => {
    const socket = getSocket(accessToken);
    socket?.emit("status:update", { status: v });
  };

  const peerStatus = peer?.status?.spotifyTrack
    ? `🎵 ${peer.status.spotifyTrack}${peer.status.spotifyArtist ? " — " + peer.status.spotifyArtist : ""}`
    : peer?.status?.customStatus ?? peer?.currentMood ?? (isOnline ? "conectado" : "desconectado");

  const grouped = useMemo(() => groupByDay(messages), [messages]);

  return (
    <GlassCard variant="strong" crt className="relative flex h-full flex-col overflow-hidden p-0">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        {peer ? (
          <>
            <Avatar src={peer.avatarUrl} name={peer.displayName} size={42} status={isOnline ? "online" : "offline"} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate font-medium">{peer.displayName}</div>
                <span className="chip text-[10px]">@{peer.username}</span>
              </div>
              <div className="truncate text-xs text-white/55">{peerStatus}</div>
            </div>
          </>
        ) : (
          <div className="text-xs text-white/55">Cargando…</div>
        )}
        <select
          onChange={(e) => updateStatus(e.target.value)}
          defaultValue="online"
          title="Tu estado"
          className="hidden rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 md:block"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.v} value={s.v} className="bg-midnight-900">
              {s.l}
            </option>
          ))}
        </select>
        <button onClick={sendNudge} className="btn-icon" title="Zumbido">
          <Zap size={14} />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-5">
        {grouped.length === 0 && peer && (
          <div className="mx-auto mt-8 max-w-sm text-center text-xs text-white/50">
            <Sparkles size={18} className="mx-auto mb-2 opacity-60" />
            Es vuestra primera conversación. <br /> Saluda con un “hola :)” como en 2003.
          </div>
        )}
        {grouped.map((group) => (
          <div key={group.day}>
            <div className="my-3 text-center text-[10px] uppercase tracking-widest text-white/35">
              {group.day}
            </div>
            <div className="space-y-1.5">
              {group.items.map((m) => {
                const mine = m.senderId === me?.id;
                if (m.messageType === "nudge") {
                  return (
                    <div key={m.id} className="my-2 text-center text-xs text-msn-orange/80">
                      💢 {mine ? "Tú" : peer?.displayName} envió un zumbido
                    </div>
                  );
                }
                return (
                  <motion.div
                    key={m.id}
                    variants={messageBubble}
                    initial="hidden"
                    animate="visible"
                    className={clsx("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div className={clsx("max-w-[78%]")}>
                      <div
                        className={clsx(
                          "rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-glow",
                          mine
                            ? "rounded-br-md bg-gradient-to-br from-[var(--era-accent)] to-[var(--era-glow)] text-midnight-950"
                            : "rounded-bl-md bg-white/[0.07] text-white/90"
                        )}
                      >
                        {m.content}
                      </div>
                      <div className={clsx("mt-1 text-[10px] text-white/35", mine ? "text-right" : "text-left")}>
                        {new Date(m.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-1 text-xs text-white/55"
            >
              <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:240ms]" />
              </span>
              {peer?.displayName ?? "alguien"} está escribiendo…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* composer */}
      <form onSubmit={send} className="border-t border-white/[0.06] p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setText((t) => t + e)}
              className="chip cursor-pointer text-base"
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-1.5">
          <Smile size={16} className="ml-1 text-white/45" />
          <input
            value={text}
            onChange={(e) => onTyping(e.target.value)}
            placeholder="Escribe algo lento, como en 2003…"
            className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-white/35"
          />
          <button type="button" onClick={sendNudge} className="btn-icon" title="Zumbido">
            <Bell size={14} />
          </button>
          <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
            <Send size={13} />
            Enviar
          </button>
        </div>
      </form>
    </GlassCard>
  );
}

function groupByDay(messages: Message[]): Array<{ day: string; items: Message[] }> {
  const groups: Record<string, Message[]> = {};
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const key = d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return Object.entries(groups).map(([day, items]) => ({ day, items }));
}
