import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";

const HOME_RATE_PERIOD_NANOSECONDS = BigInt(HOME_RATE_PERIOD_SECONDS) * 1_000_000_000n;

// The Realm Currency or Realm Bounty a store holds at `now`, and the instant it has accrued to, from the amount it held
// At `accruedAt`. Only whole units are produced, each taking its share of the period at the rate, and the time they
// Take moves `accruedAt` on, so the time they do not use carries to the next read. A store at its limit holds no more
// And accrues to `now`. A clock read below `accruedAt`, from a clock set back, produces nothing and moves nothing
export const computeHomeAccrued = (
  stored: number,
  accruedAt: Temporal.Instant,
  now: Temporal.Instant,
  { limit, ratePerPeriod }: { limit: number; ratePerPeriod: number },
): { accruedAt: Temporal.Instant; amount: number } => {
  const elapsedNanoseconds = now.epochNanoseconds - accruedAt.epochNanoseconds;
  const produced =
    elapsedNanoseconds > 0n ? (BigInt(ratePerPeriod) * elapsedNanoseconds) / HOME_RATE_PERIOD_NANOSECONDS : 0n;
  const amount = Math.min(limit, stored + Number(produced));
  if (amount === limit) return { accruedAt: Temporal.Instant.compare(now, accruedAt) > 0 ? now : accruedAt, amount };
  const usedNanoseconds = produced > 0n ? (produced * HOME_RATE_PERIOD_NANOSECONDS) / BigInt(ratePerPeriod) : 0n;
  return { accruedAt: Temporal.Instant.fromEpochNanoseconds(accruedAt.epochNanoseconds + usedNanoseconds), amount };
};
