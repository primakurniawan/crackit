'use client';
import React from 'react';

interface TimerProps {
  duration: number; // seconds
  onExpire: () => void;
  paused?: boolean;
  key?: string | number; // force reset via key prop
}

const SIZE = 96;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function Timer({ duration, onExpire, paused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(duration);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpired = React.useRef(false);

  // Reset when duration key changes (parent should change `key` prop)
  React.useEffect(() => {
    setTimeLeft(duration);
    hasExpired.current = false;
  }, [duration]);

  React.useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (!hasExpired.current) {
            hasExpired.current = true;
            setTimeout(onExpire, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, onExpire]);

  const progress = timeLeft / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Color: green -> amber -> red
  let strokeColor = '#10b981'; // green
  if (progress < 0.5) strokeColor = '#f59e0b'; // amber
  if (progress < 0.2) strokeColor = '#ef4444'; // red

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const label = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} className="timer-ring">
        <circle className="timer-track" cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} />
        <circle
          className="timer-fill"
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          strokeWidth={STROKE}
          stroke={strokeColor}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: timeLeft < 10 ? 22 : 18,
          color: strokeColor,
          transition: 'color 0.5s',
          lineHeight: 1,
        }}>{label}</span>
        {timeLeft === 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em', marginTop: 2 }}>
            TIME!
          </span>
        )}
      </div>
    </div>
  );
}
