import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "soft";
  glow?: boolean;
  crt?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { className, variant = "default", glow, crt, children, ...rest },
  ref
) {
  const variantClass =
    variant === "strong" ? "glass-strong" : variant === "soft" ? "glass-soft" : "glass";
  return (
    <motion.div
      ref={ref}
      className={clsx(
        "relative rounded-3xl",
        variantClass,
        glow && "ring-glow",
        crt && "crt overflow-hidden",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
