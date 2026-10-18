import { computeLastWeeklyReset } from "#src/services/time/computeLastWeeklyReset";

// Whether a claim made at `claimedAt` counts toward the week at `now`: made at or after the week's reset and by `now`, a claim
// At the reset counting toward the new week
export const checkIsWeeklyClaimed = (claimedAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(claimedAt, computeLastWeeklyReset(now)) >= 0 &&
  Temporal.Instant.compare(claimedAt, now) <= 0;
