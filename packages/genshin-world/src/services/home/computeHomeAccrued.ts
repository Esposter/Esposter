import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";

// The Realm Currency or Realm Bounty a store holds after `elapsedSeconds` at `ratePerPeriod`, from the amount it held when it
// Was last claimed. Only whole units are produced, and a store never holds more than its limit. An elapsed span read below
// Zero, from a clock set back, produces nothing
export const computeHomeAccrued = (
  stored: number,
  { elapsedSeconds, limit, ratePerPeriod }: { elapsedSeconds: number; limit: number; ratePerPeriod: number },
): number => {
  const produced = Math.floor((ratePerPeriod * Math.max(elapsedSeconds, 0)) / HOME_RATE_PERIOD_SECONDS);
  return Math.min(limit, stored + produced);
};
