import { dayjs } from "#shared/services/dayjs";
import { getCountdown } from "#shared/services/dayjs/getCountdown";
import { SECOND } from "@esposter/shared";

const COUNTDOWN_INTERVAL_MS = SECOND;
// A deadline on screen is a number that moves on its own, so the reader watches it run down rather than
// Waiting for the next read to tell them where it got to. One clock drives both answers, so the copy cannot
// Flip to expired while the digits still show time left
export const useCountdown = (expiresAt: MaybeRefOrGetter<Date | null | undefined>) => {
  const now = useNow({ scheduler: (callback) => useIntervalFn(callback, COUNTDOWN_INTERVAL_MS) });
  const remainingMs = computed(() => {
    const expiresAtValue = toValue(expiresAt);
    return expiresAtValue ? dayjs(expiresAtValue).diff(now.value) : 0;
  });
  const countdown = computed(() => getCountdown(remainingMs.value));
  const isExpired = computed(() => Boolean(toValue(expiresAt)) && remainingMs.value <= 0);
  return { countdown, isExpired };
};
