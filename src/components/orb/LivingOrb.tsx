import { motion, type HTMLMotionProps } from "motion/react";

type OrbBaseProps = {
  image: string;
  active?: boolean;
  className?: string;
};

type LivingOrbButtonProps = OrbBaseProps &
  Omit<HTMLMotionProps<"button">, "children" | "className"> & {
    ariaLabel: string;
  };

type LivingOrbDisplayProps = OrbBaseProps &
  Omit<HTMLMotionProps<"div">, "children" | "className"> & {
    ariaLabel: string;
  };

function OrbCore({ image }: { image: string }) {
  return (
    <>
      <span className="living-orb__glow" aria-hidden="true" />
      <span className="living-orb__rim" aria-hidden="true">
        <img src={image} alt="" draggable="false" />
      </span>
      <span className="living-orb__pulse" aria-hidden="true" />
    </>
  );
}

export function LivingOrbButton({
  image,
  active = false,
  className = "",
  ariaLabel,
  ...motionProps
}: LivingOrbButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      className={`living-orb ${active ? "living-orb--active" : ""} ${className}`}
      {...motionProps}
    >
      <OrbCore image={image} />
    </motion.button>
  );
}

export function LivingOrbDisplay({
  image,
  active = false,
  className = "",
  ariaLabel,
  ...motionProps
}: LivingOrbDisplayProps) {
  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      className={`living-orb ${active ? "living-orb--active" : ""} ${className}`}
      {...motionProps}
    >
      <OrbCore image={image} />
    </motion.div>
  );
}
