import { motion, type HTMLMotionProps } from "motion/react";
import type { CSSProperties } from "react";

type OrbBaseProps = {
  image: string;
  active?: boolean;
  className?: string;
  materialLayoutId?: string;
};

type LivingOrbButtonProps = OrbBaseProps &
  Omit<HTMLMotionProps<"button">, "children" | "className"> & {
    ariaLabel: string;
  };

type LivingOrbDisplayProps = OrbBaseProps &
  Omit<HTMLMotionProps<"div">, "children" | "className"> & {
    ariaLabel: string;
  };

const particles = [
  ["-120px", "-96px", "-16px", "-12px", "0ms", "5px"],
  ["-82px", "-146px", "10px", "-18px", "140ms", "4px"],
  ["-20px", "-128px", "8px", "-10px", "260ms", "6px"],
  ["68px", "-132px", "14px", "-14px", "80ms", "5px"],
  ["128px", "-78px", "18px", "-6px", "210ms", "4px"],
  ["148px", "-8px", "16px", "8px", "340ms", "5px"],
  ["112px", "88px", "12px", "14px", "120ms", "6px"],
  ["38px", "146px", "4px", "18px", "420ms", "4px"],
  ["-54px", "136px", "-8px", "16px", "300ms", "5px"],
  ["-138px", "62px", "-16px", "8px", "180ms", "4px"],
  ["-152px", "-18px", "-18px", "-2px", "380ms", "5px"],
  ["18px", "-176px", "0px", "-20px", "520ms", "3px"],
] as const;

function OrbCore({
  image,
  materialLayoutId,
}: {
  image: string;
  materialLayoutId?: string;
}) {
  return (
    <>
      <span className="living-orb__glow" aria-hidden="true" />
      {materialLayoutId && (
        <motion.span
          layoutId={materialLayoutId}
          className="living-orb__material"
          aria-hidden="true"
        />
      )}
      <span className="living-orb__particles" aria-hidden="true">
        {particles.map(([x, y, tx, ty, delay, size], index) => (
          <span
            key={`${x}-${y}`}
            className={`living-orb__particle living-orb__particle--${
              (index % 3) + 1
            }`}
            style={
              {
                "--particle-x": x,
                "--particle-y": y,
                "--particle-tx": tx,
                "--particle-ty": ty,
                "--particle-delay": delay,
                "--particle-size": size,
              } as CSSProperties
            }
          />
        ))}
      </span>
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
  materialLayoutId,
  ...motionProps
}: LivingOrbButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      className={`living-orb ${active ? "living-orb--active" : ""} ${className}`}
      {...motionProps}
    >
      <OrbCore image={image} materialLayoutId={materialLayoutId} />
    </motion.button>
  );
}

export function LivingOrbDisplay({
  image,
  active = false,
  className = "",
  ariaLabel,
  materialLayoutId,
  ...motionProps
}: LivingOrbDisplayProps) {
  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      className={`living-orb ${active ? "living-orb--active" : ""} ${className}`}
      {...motionProps}
    >
      <OrbCore image={image} materialLayoutId={materialLayoutId} />
    </motion.div>
  );
}
