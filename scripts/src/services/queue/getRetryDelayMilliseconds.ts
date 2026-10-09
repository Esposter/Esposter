import { PUSH_RETRY_BASE_MILLISECONDS, PUSH_RETRY_CAP_MILLISECONDS } from "#src/services/queue/constants";

// The wait before the retry that follows `attempts` pushes: a random share of the exponential bound, base doubling with
// Each attempt up to the cap. `random` is passed in so the draw is the same in every test
export const getRetryDelayMilliseconds = (attempts: number, random: () => number = Math.random): number =>
  random() * Math.min(PUSH_RETRY_CAP_MILLISECONDS, PUSH_RETRY_BASE_MILLISECONDS * 2 ** (attempts - 1));
