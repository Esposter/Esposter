import { checkIsWeeklyClaimed } from "#src/services/weekly/checkIsWeeklyClaimed";

// How many claims, across every kind counted weekly together, were made since the week's reset and by `now`, a claim at the
// Reset counting toward the new week
export const countWeeklyClaims = (claimedAts: readonly Temporal.Instant[], now: Temporal.Instant): number =>
  claimedAts.filter((claimedAt) => checkIsWeeklyClaimed(claimedAt, now)).length;
