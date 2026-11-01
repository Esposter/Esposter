import { FISH_RESPAWN_DURATION } from "#src/services/fishing/constants";

// Whether a caught fish is back in its stock at `now`: seventy-two hours after its catch, and not before
export const checkIsFishingCatchReturned = (caughtAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(now, caughtAt.add(FISH_RESPAWN_DURATION)) >= 0;
