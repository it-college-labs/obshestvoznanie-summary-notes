import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { publicAsset } from "../../content/assets";
import { LivingOrbButton } from "../orb/LivingOrb";

type IntroSceneProps = {
  onActivate: () => void;
};

const guideBot = publicAsset("assets/placeholders/bot-placeholder.png");

export function IntroScene({ onActivate }: IntroSceneProps) {
  const [isActivating, setIsActivating] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const botDelay = shouldReduceMotion ? 0.2 : 2;
  const exitDelay = shouldReduceMotion ? 80 : 300;

  const activate = () => {
    if (isActivating) return;
    setIsActivating(true);
    window.setTimeout(onActivate, exitDelay);
  };

  return (
    <motion.section
      className="intro-scene"
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid-field" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />

      <LivingOrbButton
        className={`intro-orb ${isActivating ? "intro-orb--materializing" : ""}`}
        image={guideBot}
        active
        materialLayoutId="content-shell"
        ariaLabel="Открыть нейроархив"
        onClick={activate}
        initial={{ opacity: 0, x: "34vw", scale: 0.72 }}
        animate={{
          opacity: isActivating ? 0.96 : 1,
          x: isActivating ? "calc(50vw - 94px)" : 0,
          scale: isActivating ? 0.82 : [0.72, 1.08, 0.97, 1],
        }}
        transition={{
          delay: isActivating ? 0 : botDelay,
          duration: shouldReduceMotion ? 0.35 : 1.45,
          ease: [0.16, 1, 0.3, 1],
          scale: {
            type: shouldReduceMotion ? "tween" : "spring",
            stiffness: 110,
            damping: 13,
          },
        }}
        whileTap={{ scale: 0.96 }}
      />
    </motion.section>
  );
}
