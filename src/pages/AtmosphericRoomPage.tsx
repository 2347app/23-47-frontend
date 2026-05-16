import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Users } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useRoomsStore } from "../store/rooms.store";
import { getSocket } from "../websocket/socket";

const ROOM_META = [
  {
    slug: "verano-2003",
    title: "Verano de 2003",
    emoji: "☀️",
    sub: "Tardes de Fotolog y 56k sin ningún motivo.",
    accent: "#fbbf24",
    image: "/rooms/2003-sala_verano.png",
  },
  {
    slug: "madrugada-2004",
    title: "Madrugada de 2004",
    emoji: "🌙",
    sub: "La noche en que internet parecía más humano.",
    accent: "#818cf8",
    image: "/rooms/2004-sala_madrugada.png",
  },
  {
    slug: "lluvia-2005",
    title: "Lluvia de 2005",
    emoji: "🌧️",
    sub: "Bajar el Messenger mientras llueve por la ventana.",
    accent: "#6ea8fe",
    image: "/rooms/2005-sala_lluvia%20.png",
  },
  {
    slug: "verano-social-2006",
    title: "Verano Social 2006",
    emoji: "🌊",
    sub: "Emoticones, nudges y temas de MSN hasta tarde.",
    accent: "#34d399",
    image: "/rooms/2006-sala_verano_social.png",
  },
  {
    slug: "noche-melancolica-2007",
    title: "Noche Melancólica de 2007",
    emoji: "🌑",
    sub: "Football Manager, eMule y un chat abierto a las 3am.",
    accent: "#c084fc",
    image: "/rooms/2007-sala_noche_melancolica.png",
  },
];

interface RoomMessage {
  id: string;
  fromUserId: string;
  fromUsername: string;
  content: string;
  at: number;
}

export function AtmosphericRoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const { members, join, leave, onPresence } = useRoomsStore();

  const room = ROOM_META.find((r) => r.slug === slug);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomMembers = members[slug ?? ""] ?? [];

  useEffect(() => {
    if (!slug || !room) { navigate("/app/rooms"); return; }

    const socket = getSocket(token);
    if (!socket) return;

    socket.emit("room:join", { slug }, (res: { ok: boolean }) => {
      if (res?.ok) join(slug);
    });

    const onChat = (msg: RoomMessage) => {
      setMessages((prev) => [...prev, { ...msg, id: msg.id ?? String(msg.at) }]);
    };

    socket.on("room:chat", onChat);

    return () => {
      socket.off("room:chat", onChat);
      socket.emit("room:leave", { slug });
      if (user) {
        onPresence({ type: "leave", userId: user.id, username: user.username, slug });
      }
      leave();
    };
  }, [slug, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !slug) return;
    getSocket(token)?.emit("room:chat", { slug, content });
    setInput("");
  };

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${room.image}")` }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(4,6,12,0.50) 0%, rgba(4,6,12,0.15) 38%, rgba(4,6,12,0.80) 58%, rgba(4,6,12,0.97) 100%)",
        }}
      />
      {/* Mobile top gradient */}
      <div
        className="absolute inset-x-0 top-0 h-24 md:hidden"
        style={{ background: "linear-gradient(to bottom, rgba(4,6,12,0.75), transparent)" }}
      />

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate("/app/rooms")}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white transition-all"
          style={{
            background: "rgba(4,6,12,0.55)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <ArrowLeft size={12} />
          Salas
        </button>
        <span className="text-sm text-white/50 font-light">
          {room.emoji} {room.title}
        </span>
      </div>

      {/* ── Left: room info (desktop) ── */}
      <div className="relative z-10 hidden md:flex flex-1 flex-col justify-end p-8 pb-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-5xl mb-3">{room.emoji}</div>
          <h1
            className="text-4xl font-bold text-white leading-tight"
            style={{ textShadow: "0 2px 28px rgba(0,0,0,0.95)", fontFamily: "Georgia, serif" }}
          >
            {room.title}
          </h1>
          <p
            className="mt-2 text-white/55 text-base max-w-xs"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.95)" }}
          >
            {room.sub}
          </p>
          <div
            className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
            style={{
              background: `${room.accent}18`,
              border: `1px solid ${room.accent}35`,
              color: room.accent,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: room.accent }}
            />
            {roomMembers.length} en la sala ahora
          </div>
        </motion.div>
      </div>

      {/* ── Right panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col w-full md:w-80 lg:w-96 mt-auto md:mt-0"
        style={{
          background: "rgba(4,6,12,0.90)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          height: "calc(100vh - 0px)",
          maxHeight: "100dvh",
        }}
      >
        {/* Mobile: room title inside panel */}
        <div
          className="md:hidden px-4 pt-16 pb-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="text-2xl mb-1">{room.emoji}</div>
          <div className="font-semibold text-white/90 text-lg">{room.title}</div>
          <div className="text-xs text-white/40 mt-0.5">{room.sub}</div>
        </div>

        {/* ── Members ── */}
        <div
          className="px-4 pt-5 pb-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={11} style={{ color: room.accent }} />
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/40">
              Usuarios en la sala
            </span>
            <span
              className="ml-auto text-[10px] rounded-full px-2 py-0.5 font-mono"
              style={{ background: `${room.accent}20`, color: room.accent }}
            >
              {roomMembers.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {roomMembers.map((m) => (
                <motion.div
                  key={m.userId}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: room.accent, boxShadow: `0 0 5px ${room.accent}80` }}
                  />
                  <span className="text-sm text-white/75 truncate">{m.username}</span>
                  {m.userId === user?.id && (
                    <span className="ml-auto text-[10px] text-white/25 flex-shrink-0">tú</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {roomMembers.length === 0 && (
              <p className="text-xs text-white/25 italic">Nadie aquí todavía...</p>
            )}
          </div>
        </div>

        {/* ── Chat header ── */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="text-[10px] uppercase tracking-[0.28em] text-white/40">
            Chat de la sala
          </span>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-white/20 italic">El silencio también tiene su magia.</p>
              <p className="text-xs text-white/12 mt-1">Sé el primero en escribir.</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.fromUserId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  {!isOwn && (
                    <span
                      className="text-[10px] mb-1 px-1"
                      style={{ color: room.accent }}
                    >
                      {msg.fromUsername}
                    </span>
                  )}
                  <span
                    className="inline-block px-3 py-1.5 rounded-2xl text-sm text-white/88 max-w-[88%] break-words leading-relaxed"
                    style={
                      isOwn
                        ? {
                            background: `${room.accent}25`,
                            border: `1px solid ${room.accent}38`,
                            borderBottomRightRadius: "4px",
                          }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderBottomLeftRadius: "4px",
                          }
                    }
                  >
                    {msg.content}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div
          className="px-3 py-3 border-t"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(4,6,12,0.6)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe algo..."
              autoComplete="off"
              className="flex-1 rounded-xl px-3 py-2 text-sm text-white/90 placeholder-white/25 outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = `${room.accent}55`)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl px-3 py-2 transition-all duration-200 disabled:opacity-30 hover:brightness-110"
              style={{ background: room.accent, color: "#04060c" }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
