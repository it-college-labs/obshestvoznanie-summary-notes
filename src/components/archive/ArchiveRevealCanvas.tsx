import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type ArchiveRevealCanvasProps = {
  onComplete: () => void;
};

function easeOutExpo(value: number) {
  return value === 1 ? 1 : 1 - 2 ** (-10 * value);
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const clampedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + clampedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, clampedRadius);
  context.arcTo(x + width, y + height, x, y + height, clampedRadius);
  context.arcTo(x, y + height, x, y, clampedRadius);
  context.arcTo(x, y, x + width, y, clampedRadius);
  context.closePath();
}

export function ArchiveRevealCanvas({ onComplete }: ArchiveRevealCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let completeTimer = 0;
    const start = performance.now();
    const duration = 1260;
    const pixelRatio = window.devicePixelRatio || 1;

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = Math.floor(innerWidth * pixelRatio);
      canvas.height = Math.floor(innerHeight * pixelRatio);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (now: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(progress);
      const margin = Math.max(20, Math.min(48, width * 0.04));
      const sourceX = width * 0.88;
      const sourceY = height * 0.48;
      const targetX = margin;
      const targetY = margin;
      const targetWidth = width - margin * 2;
      const targetHeight = height - margin * 2;
      const rectX = sourceX + (targetX - sourceX) * eased;
      const rectY = sourceY + (targetY - sourceY) * eased;
      const rectWidth = 92 + (targetWidth - 92) * eased;
      const rectHeight = 92 + (targetHeight - 92) * eased;
      const radius = 46 + (32 - 46) * eased;

      context.clearRect(0, 0, width, height);
      context.save();
      context.globalAlpha = 0.96;
      context.fillStyle = "#e4e6ea";
      roundedRect(context, rectX, rectY, rectWidth, rectHeight, radius);
      context.fill();

      const gradient = context.createRadialGradient(
        sourceX,
        sourceY,
        10,
        sourceX,
        sourceY,
        Math.max(width, height) * 0.72,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.84)");
      gradient.addColorStop(0.42, "rgba(156, 163, 175, 0.18)");
      gradient.addColorStop(1, "rgba(156, 163, 175, 0)");
      context.fillStyle = gradient;
      context.fill();
      context.restore();

      if (progress < 1) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        completeTimer = window.setTimeout(onComplete, 140);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="archive-reveal-canvas"
      aria-hidden="true"
    />
  );
}
