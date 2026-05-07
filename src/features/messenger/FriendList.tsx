import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Search, UserPlus2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar } from "../../components/Avatar";
import { GlassCard } from "../../components/GlassCard";
import { api } from "../../services/api";
import { usePresenceStore } from "../../store/presence.store";

export interface Friend {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    currentMood?: string | null;
    status?: { status: string; customStatus?: string | null; spotifyTrack?: string | null; spotifyArtist?: string | null } | null;
  };
}

export function FriendList({
  activePeerId,
  onSelect,
}: {
  activePeerId: string | null;
  onSelect: (id: string) => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const onlineSet = usePresenceStore((s) => s.online);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ friends: Friend[] }>("/friends");
      setFriends(data.friends);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get<{ users: any[] }>("/users/search", { params: { q: search } });
        setResults(data.users);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const onAdd = async (userId: string) => {
    try {
      await api.post("/friends", { friendId: userId });
      toast.success("Amistad sincronizada 💌");
      await load();
      setSearch("");
      setResults([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo añadir");
    }
  };

  const sorted = useMemo(() => {
    return [...friends].sort((a, b) => {
      const ao = onlineSet.has(a.user.id) ? 0 : 1;
      const bo = onlineSet.has(b.user.id) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return a.user.displayName.localeCompare(b.user.displayName);
    });
  }, [friends, onlineSet]);

  const onlineCount = sorted.filter((f) => onlineSet.has(f.user.id)).length;

  return (
    <GlassCard className="flex h-full flex-col overflow-hidden p-0">
      <div className="border-b border-white/[0.06] p-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50">
          <Users size={14} /> amigos
          <span className="ml-auto rounded-full bg-msn-green/15 px-2 py-0.5 text-[10px] font-medium text-msn-green">
            {onlineCount} online
          </span>
        </div>
        <div className="relative mt-3">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Buscar para añadir…"
          />
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {results.length > 0 && (
        <div className="border-b border-white/[0.06] p-2">
          <div className="px-2 pb-1 text-[10px] uppercase tracking-widest text-white/40">Resultados</div>
          <div className="space-y-1">
            {results.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/[0.04]">
                <Avatar src={u.avatarUrl} name={u.displayName} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{u.displayName}</div>
                  <div className="truncate text-[11px] text-white/50">@{u.username}</div>
                </div>
                <button onClick={() => onAdd(u.id)} className="btn-icon" title="Añadir amigo">
                  <UserPlus2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-white/55">
            Aún no tienes amigos.<br />
            Busca a alguien arriba ↑
          </div>
        ) : (
          sorted.map((f) => {
            const online = onlineSet.has(f.user.id);
            const status = f.user.status;
            const subtitle = status?.spotifyTrack
              ? `🎵 ${status.spotifyTrack}${status.spotifyArtist ? " — " + status.spotifyArtist : ""}`
              : status?.customStatus ?? f.user.currentMood ?? (online ? "online" : "offline");
            return (
              <motion.button
                key={f.user.id}
                onClick={() => onSelect(f.user.id)}
                whileHover={{ x: 2 }}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
                  activePeerId === f.user.id
                    ? "bg-white/[0.07] ring-1 ring-white/10"
                    : "hover:bg-white/[0.04]"
                )}
              >
                <Avatar
                  src={f.user.avatarUrl}
                  name={f.user.displayName}
                  size={36}
                  status={online ? "online" : "offline"}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.user.displayName}</div>
                  <div className="truncate text-[11px] text-white/55">{subtitle}</div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
