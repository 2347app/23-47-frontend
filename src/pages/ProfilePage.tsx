import { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Save, Power } from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard } from "../components/GlassCard";
import { Avatar } from "../components/Avatar";
import { useAuthStore } from "../store/auth.store";
import { api, API_BASE_URL } from "../services/api";
import { fadeUp, stagger } from "../animations/variants";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    bio: user?.bio ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    currentMood: user?.currentMood ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", {
        ...form,
        avatarUrl: form.avatarUrl || null,
        currentMood: form.currentMood || null,
      });
      setUser(data.user);
      toast.success("Perfil guardado 🌙");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const connectSpotify = () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    window.location.href = `${API_BASE_URL}/api/spotify/authorize?token=${encodeURIComponent(token)}`;
  };

  const disconnectSpotify = async () => {
    await api.post("/spotify/disconnect");
    await fetchMe();
    toast.success("Spotify desconectado");
  };

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <GlassCard variant="strong" className="flex flex-col items-center gap-4 p-6 md:flex-row">
          <Avatar src={user?.avatarUrl} name={user?.displayName ?? ""} size={84} status="online" />
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">Perfil</div>
            <div className="mt-1 font-display text-2xl">{user?.displayName}</div>
            <div className="text-sm text-white/55">@{user?.username}</div>
            <div className="mt-2 text-xs text-white/55">{user?.bio || "Sin biografía aún."}</div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="space-y-4 p-6">
          <h2 className="font-display text-xl">Editar perfil</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Nombre</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Mood</label>
              <input
                value={form.currentMood}
                onChange={(e) => setForm({ ...form, currentMood: e.target.value })}
                className="input"
                placeholder="🌙 escuchando música"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Avatar (URL)</label>
              <input
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="input"
                placeholder="https://…"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="input"
                placeholder="Cuéntales algo bonito a las 3 AM"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={save} disabled={saving} className="btn-primary text-xs">
              <Save size={14} /> {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/50">
                <Music2 size={14} /> Spotify
              </div>
              <div className="mt-1 text-sm text-white/70">
                {user?.spotifyConnected
                  ? "Conectado. Lo que escuchas aparecerá en tu estado."
                  : "Conecta tu cuenta para compartir música."}
              </div>
            </div>
            {user?.spotifyConnected ? (
              <button onClick={disconnectSpotify} className="btn-ghost text-xs">
                <Power size={14} /> Desconectar
              </button>
            ) : (
              <button onClick={connectSpotify} className="btn-primary text-xs">
                Conectar Spotify
              </button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
