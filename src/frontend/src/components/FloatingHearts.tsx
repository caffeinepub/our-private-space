import { useMemo } from "react";

const HEART_COLORS = [
  "#FF6B8A",
  "#FF4B6E",
  "#FF1744",
  "#E91E8C",
  "#9C27B0",
  "#CE93D8",
  "#F48FB1",
  "#FF80AB",
  "#F06292",
  "#BA68C8",
];

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
  endScale: number;
  endRotate: number;
}

function HeartSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      role="presentation"
      style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
    >
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
    </svg>
  );
}

export default function FloatingHearts({ count = 25 }: { count?: number }) {
  const hearts = useMemo<HeartParticle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 16 + Math.random() * 32,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 120,
      endScale: 0.5 + Math.random() * 1,
      endRotate: (Math.random() - 0.5) * 60,
    }));
  }, [count]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute bottom-0 heart-float"
          style={
            {
              left: `${h.left}%`,
              "--duration": `${h.duration}s`,
              "--delay": `${h.delay}s`,
              "--drift": `${h.drift}px`,
              "--end-scale": h.endScale,
              "--end-rotate": `${h.endRotate}deg`,
            } as React.CSSProperties
          }
        >
          <HeartSVG color={h.color} size={h.size} />
        </div>
      ))}
    </div>
  );
}
