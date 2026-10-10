import { WORLD_LEVEL_ADJUSTMENT_COOLDOWN } from "#src/services/adventureRank/constants";

// The time left before the World Level can be changed again at `now`, or none once the cooldown has run or when no
// Change has been made
export const computeWorldLevelCooldown = (
  changedAt: Temporal.Instant | undefined,
  now: Temporal.Instant,
): Temporal.Duration | undefined => {
  if (changedAt === undefined) return undefined;
  const changeableAt = changedAt.add(WORLD_LEVEL_ADJUSTMENT_COOLDOWN);
  if (Temporal.Instant.compare(now, changeableAt) >= 0) return undefined;
  return changeableAt.since(now, { largestUnit: "hour", roundingMode: "ceil", smallestUnit: "minute" });
};
