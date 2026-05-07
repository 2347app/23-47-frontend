import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GlassCard } from "../components/GlassCard";
import { useAuthStore } from "../store/auth.store";
import { SFX } from "../audio/soundManager";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(identifier, password);
      SFX.login();
      toast.success("Bienvenida de vuelta 🌙");
      navigate("/app", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo iniciar sesión");
    }
  };

  return (
    <GlassCard variant="strong" className="p-7">
      <div className="text-xs uppercase tracking-[0.28em] text-white/45">Iniciar sesión</div>
      <h1 className="mt-2 font-display text-3xl text-glow">¿Hay alguien conectado?</h1>
      <p className="mt-2 text-sm text-white/60">
        Vuelve a tus madrugadas. Solo necesitamos tu usuario y tu contraseña.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email o usuario</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input"
            placeholder="marina_03"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Conectando…" : "Entrar"}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-white/55">
        ¿Aún no tienes cuenta?{" "}
        <Link to="/register" className="text-white underline-offset-4 hover:underline">
          Créala en un minuto
        </Link>
      </div>
    </GlassCard>
  );
}
