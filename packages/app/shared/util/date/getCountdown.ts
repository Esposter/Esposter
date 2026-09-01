const COUNTDOWN_PART_LENGTH = 2;

// Discord counts an invite down as dd:hh:mm:ss, where the day part appears only once there is a day left.
// Padding every part keeps the column at its width as the number shrinks rather than jittering each second
export const getCountdown = (remainingMs: number) => {
  // Balanced into day/hour/minute/second fields — a duration constructed from milliseconds carries all of
  // Them in `milliseconds` until it is rounded, so every part below it would read zero
  const duration = Temporal.Duration.from({ milliseconds: Math.max(remainingMs, 0) }).round({
    largestUnit: "day",
  });
  const parts = [duration.hours, duration.minutes, duration.seconds];
  const { days } = duration;
  if (days > 0) parts.unshift(days);
  return parts.map((part) => String(part).padStart(COUNTDOWN_PART_LENGTH, "0")).join(":");
};
