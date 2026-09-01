import { getCountdown } from "#shared/util/date/getCountdown";

const COUNTDOWN_INTERVAL_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
// A deadline on screen is a number that moves on its own, so the reader watches it run down rather than
// Waiting for the next read to tell them where it got to. One clock drives both answers, so the copy cannot
// Flip to expired while the digits still show time left
export const useCountdown = (expiresAt: MaybeRefOrGetter<Date | null | undefined>) => {
  const now = useNow({ scheduler: (callback) => useIntervalFn(callback, COUNTDOWN_INTERVAL_MS) });
  const remainingMs = computed(() => {
    const expiresAtValue = toValue(expiresAt);
    return expiresAtValue ? expiresAtValue.getTime() - now.value.getTime() : 0;
  });
  const countdown = computed(() => getCountdown(remainingMs.value));
  const isExpired = computed(() => Boolean(toValue(expiresAt)) && remainingMs.value <= 0);
  return { countdown, isExpired };
};
