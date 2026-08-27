import { dayjs } from "#shared/services/dayjs";

const COUNTDOWN_PART_LENGTH = 2;

// Discord counts an invite down as dd:hh:mm:ss, where the day part appears only once there is a day left.
// Padding every part keeps the column at its width as the number shrinks rather than jittering each second
export const getCountdown = (remainingMs: number) => {
  const duration = dayjs.duration(Math.max(remainingMs, 0));
  const parts = [duration.hours(), duration.minutes(), duration.seconds()];
  const days = Math.floor(duration.asDays());
  if (days > 0) parts.unshift(days);
  return parts.map((part) => String(part).padStart(COUNTDOWN_PART_LENGTH, "0")).join(":");
};
