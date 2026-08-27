import { dayjs } from "#shared/services/dayjs";

const COUNTDOWN_PART_LENGTH = 2;

// dd:hh:mm:ss, the shape Discord counts an invite down in. The day part appears only once there is a day left,
// And every part is padded so the column keeps its width as the number shrinks rather than jittering each second
export const getCountdown = (remainingMs: number) => {
  const duration = dayjs.duration(Math.max(remainingMs, 0));
  const parts = [duration.hours(), duration.minutes(), duration.seconds()];
  const days = Math.floor(duration.asDays());
  if (days > 0) parts.unshift(days);
  return parts.map((part) => String(part).padStart(COUNTDOWN_PART_LENGTH, "0")).join(":");
};
