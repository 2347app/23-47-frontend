import { Link } from "react-router-dom";
import { Backdrop } from "../components/backdrops/Backdrop";

export function NotFoundPage() {
  return (
    <div className="relative min-h-screen text-white">
      <Backdrop />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
          dial-up · 404
        </div>
        <h1 className="mt-3 font-display text-5xl text-glow md:text-7xl">
          Esta página se ha desconectado.
        </h1>
        <p className="mt-3 max-w-md text-white/65">
          Quizá el módem se cortó. Vuelve a la pantalla principal y prueba de nuevo en un rato.
        </p>
        <Link to="/" className="btn-primary mt-8 text-xs">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
