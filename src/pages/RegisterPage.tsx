import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GlassCard } from "../components/GlassCard";
import { useAuthStore } from "../store/auth.store";
import { SFX } from "../audio/soundManager";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [form, setForm] = useState({ email: "", username: "", displayName: "", password: "" });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      SFX.login();
      toast.success("Cuenta creada. Bienvenida.");
      navigate("/app", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo registrar");
    }
  };

  return (
    <GlassCard variant="strong" className="p-7">
      <div className="text-xs uppercase tracking-[0.28em] text-white/45">Crear cuenta</div>
      <h1 className="mt-2 font-display text-3xl text-glow">Reserva tu nick.</h1>
      <p className="mt-2 text-sm text-white/60">
        Como en 2003. Elige uno que te haga sonreír cuando lo vuelvas a ver.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Nombre que verán</label>
          <input value={form.displayName} onChange={onChange("displayName")} className="input" placeholder="Marina ✨" required />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="label">Usuario (@)</label>
            <input value={form.username} onChange={onChange("username")} className="input" placeholder="marina_03" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={onChange("email")} className="input" placeholder="t@e.com" required />
          </div>
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input type="password" value={form.password} onChange={onChange("password")} className="input" placeholder="mínimo 6 caracteres" required minLength={6} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Conectando módem…" : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-white/55">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-white underline-offset-4 hover:underline">
          Entra aquí
        </Link>
      </div>
    </GlassCard>
  );
}
