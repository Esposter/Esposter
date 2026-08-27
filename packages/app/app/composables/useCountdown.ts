import { dayjs } from "#shared/services/dayjs";
import { getCountdown } from "#shared/services/dayjs/getCountdown";

const COUNTDOWN_INTERVAL_MS = dayjs.duration(1, "second").asMilliseconds();

// A deadline on screen is a number that moves on its own: the reader watches it run down rather than waiting
// For the next read to tell them where it got to. One clock drives both answers, so the copy cannot flip to
// Expired while the digits still show time left
export const useCountdown = (expiresAt: MaybeRefOrGetter<Date | null | undefined>) => {
  const now = useNow({ interval: COUNTDOWN_INTERVAL_MS });
  const remainingMs = computed(() => {
    const expiresAtValue = toValue(expiresAt);
    return expiresAtValue ? dayjs(expiresAtValue).diff(now.value) : 0;
  });
  const countdown = computed(() => getCountdown(remainingMs.value));
  const isExpired = computed(() => Boolean(toValue(expiresAt)) && remainingMs.value <= 0);
  return { countdown, isExpired };
};
