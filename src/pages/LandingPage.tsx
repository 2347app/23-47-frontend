import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Headphones, MessageSquareHeart, Sparkles, Sofa, Clock4, Radio } from "lucide-react";
import { Backdrop } from "../components/backdrops/Backdrop";
import { GlassCard } from "../components/GlassCard";
import { AudioControl } from "../components/AudioControl";
import { ERAS } from "../themes/eras";
import { fadeUp, stagger } from "../animations/variants";
import { SFX } from "../audio/soundManager";
import { useEffect } from "react";

export function LandingPage() {
  useEffect(() => {
    const t = setTimeout(() => SFX.modem(), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Backdrop />

      {/* Top */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 items-center justify-center rounded-xl px-2.5 font-mono text-sm font-bold tracking-widest"
            style={{
              background: "linear-gradient(135deg, var(--era-accent), var(--era-glow))",
              color: "#04060c",
            }}
          >
            23:47
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#momentos" className="transition hover:text-white">Momentos</a>
          <a href="#features" className="transition hover:text-white">Experiencia</a>
          <a href="#manifesto" className="transition hover:text-white">Manifiesto</a>
        </nav>
        <div className="flex items-center gap-2">
          <AudioControl />
          <Link to="/login" className="btn-ghost text-xs">Entrar</Link>
          <Link to="/register" className="btn-primary text-xs">Reconectar</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-12 text-center md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="chip mb-6 border-white/15"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-msn-green" />
          un módem suena en algún lugar del pasado…
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 font-mono text-6xl font-bold tracking-widest md:text-8xl lg:text-9xl"
          style={{
            background: "linear-gradient(135deg, var(--era-accent), var(--era-glow))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 40px var(--era-accent))",
          }}
        >
          23:47
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance font-display text-4xl leading-[1.05] tracking-tight text-glow md:text-6xl lg:text-7xl"
        >
          Internet no era mejor.
          <br />
          <span className="text-white/60">Pero sí se sentía diferente.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 max-w-xl text-pretty text-base text-white/60 md:text-lg"
        >
          Reconecta con los momentos en los que internet todavía tenía magia.
          <br />
          No es nostalgia exacta. Es reinterpretación emocional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/register"
            className="btn-primary px-7 py-3.5 text-sm shadow-glow-lg"
            onMouseEnter={() => SFX.hover()}
          >
            Entrar en el momento <ArrowRight size={14} />
          </Link>
          <a href="#momentos" className="btn-ghost px-7 py-3.5 text-sm">
            Ver los momentos
          </a>
        </motion.div>

        {/* Mock messenger */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.4, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-4xl"
        >
          <GlassCard variant="strong" crt className="p-0 ring-glow">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-white/35">
                23:47 · madrugada-2003 · /messenger
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="border-white/[0.06] p-4 md:border-r">
                <div className="mb-3 text-xs uppercase tracking-widest text-white/40">online ahora</div>
                {[
                  { n: "marina_03", s: "🌙 escuchando Air", t: "23:47" },
                  { n: "miguel.kt", s: "🎮 Tony Hawk Pro 2", t: "21:03" },
                  { n: "sara_agosto", s: "🎵 Moby en repeat", t: "23:41" },
                ].map((u) => (
                  <div key={u.n} className="mt-2.5 flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-msn-green shadow-[0_0_10px_var(--era-accent)]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{u.n}</div>
                      <div className="truncate text-[11px] text-white/45">{u.s}</div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-white/25">{u.t}</span>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2">
                <div className="space-y-2.5 p-4 md:p-5">
                  <Bubble side="left" name="marina_03" text="Hola :) ¿qué escuchas?" />
                  <Bubble side="right" name="tú" text="moby — lift me up. está lloviendo en mi ventana" />
                  <Bubble side="left" name="marina_03" text="aquí también. quédate un rato 🌙" />
                  <Bubble side="right" name="tú" text="no pienso irme. son las 23:47." />
                  <div className="flex items-center gap-2 pt-1 text-xs text-white/35">
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40 [animation-delay:300ms]" />
                    </span>
                    marina_03 está escribiendo…
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Momentos */}
      <section id="momentos" className="relative z-10 mx-auto mt-36 max-w-6xl px-6">
        <SectionHeading
          eyebrow="Momentos emocionales"
          title="¿Cuándo se sentía especial para ti?"
          subtitle="No es solo una época: es una atmósfera completa. Colores, música, partículas, ambiente y cultura pop de ese momento exacto."
        />

        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {ERAS.slice(0, 8).map((era) => (
            <motion.div key={era.id} variants={fadeUp}>
              <GlassCard
                className="overflow-hidden p-0 transition-all hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${era.palette.accent}14, ${era.palette.bg}dd)`,
                  borderColor: `${era.palette.accent}28`,
                }}
              >
                <div
                  className="relative h-28 overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 25% 25%, ${era.palette.glow}50, transparent 55%), radial-gradient(circle at 75% 75%, ${era.palette.accent}45, transparent 55%), ${era.palette.bg}`,
                  }}
                >
                  <span className="absolute right-3 top-3 text-3xl drop-shadow">{era.emoji}</span>
                  <span className="absolute bottom-2.5 left-3 font-mono text-[10px] tracking-widest text-white/50">
                    {era.year}
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="font-display text-base leading-tight">{era.label}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/55">{era.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {era.references.slice(0, 2).map((r) => (
                      <span key={r} className="chip text-[10px]">{r}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto mt-36 max-w-6xl px-6">
        <SectionHeading
          eyebrow="Una experiencia, no una app"
          title="No buscamos que hagas scroll."
          subtitle="Buscamos que no quieras cerrarla. Sin feeds infinitos, sin métricas de vanidad. Solo momentos, música y presencia."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon={MessageSquareHeart} title="Chat íntimo en tiempo real" desc="Estados, zumbidos suaves, indicador de escritura. Diseñado para conversar despacio, como en 2003." />
          <Feature icon={Headphones} title="Spotify en tu atmósfera" desc="Lo que escuchas forma parte del momento. Tu música aparece en tu estado y en el chat, en directo." />
          <Feature icon={Sparkles} title="IA emocional" desc="La IA genera experiencias completas: luz, música, ambiente y mood adaptados a cómo te sientes ahora." />
          <Feature icon={Sofa} title="Tu cuarto digital" desc="Construye tu espacio online con objetos, posters y luz. La IA puede recrearlo a partir de tus recuerdos." />
          <Feature icon={Clock4} title="Máquina del tiempo emocional" desc="8 momentos distintos. Cada uno cambia toda la experiencia: paleta, partículas, música y cultura del momento." />
          <Feature icon={Radio} title="Modo madrugada" desc="Cuando nadie más está, 23:47 cambia. Lluvia, glow suave, ritmo bajo. La experiencia se vuelve tuya." />
        </div>
      </section>

      {/* Manifesto */}
      <section id="manifesto" className="relative z-10 mx-auto mt-36 max-w-4xl px-6 text-center">
        <SectionHeading
          eyebrow="Por qué existe 23:47"
          title="Internet ya no se siente como algo tuyo."
          subtitle="Antes tenías un nick, una canción en el estado, un cuarto online. Antes había conversaciones que duraban hasta las 4 de la mañana. 23:47 es el intento de recuperar esa sensación."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassCard className="p-6 text-left">
            <div className="text-xs uppercase tracking-widest text-msn-orange/80">Lo que no somos</div>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>· una copia de MSN o Tuenti</li>
              <li>· nostalgia kitsch o retro forzado</li>
              <li>· feeds infinitos ni métricas de vanidad</li>
              <li>· hiperestimulación constante</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-6 text-left">
            <div className="text-xs uppercase tracking-widest text-msn-green/90">Lo que sí somos</div>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>· una reinterpretación emocional premium</li>
              <li>· conversaciones lentas e íntimas</li>
              <li>· identidad (tu nick, tu cuarto, tu música)</li>
              <li>· un lugar al que volver cuando quieras calma</li>
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 mx-auto my-36 max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-mono text-sm uppercase tracking-[0.3em] text-white/40"
        >
          23:47 · 23-47.app
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-4 font-display text-3xl leading-tight text-white/90 md:text-5xl"
        >
          “No quiero cerrar esta aplicación.”
        </motion.h2>
        <p className="mt-4 text-sm text-white/50">
          Esa es la única métrica que nos importa. Empieza esta noche.
        </p>
        <Link
          to="/register"
          className="btn-primary mt-8 inline-flex px-7 py-3.5 text-sm"
          onMouseEnter={() => SFX.hover()}
        >
          Reconectar ahora <ArrowRight size={14} />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-6 text-center font-mono text-[11px] text-white/30">
        23:47 · una reinterpretación emocional del momento en que internet se sentía especial · 23-47.app
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-pretty text-sm leading-relaxed text-white/60 md:text-base">{subtitle}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <GlassCard className="p-5 transition-all hover:-translate-y-1">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, var(--era-accent), var(--era-glow))",
          color: "#04060c",
        }}
      >
        <Icon size={18} />
      </div>
      <div className="mt-4 font-medium">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-white/60">{desc}</p>
    </GlassCard>
  );
}

function Bubble({ side, name, text }: { side: "left" | "right"; name: string; text: string }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%]">
        <div className="mb-1 text-[10px] uppercase tracking-widest text-white/35">{name}</div>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            side === "right"
              ? "bg-gradient-to-br from-[var(--era-accent)] to-[var(--era-glow)] text-midnight-950"
              : "bg-white/[0.06] text-white/85"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
