import { computeMiningOutcropRespawn } from "#src/services/leyLine/computeMiningOutcropRespawn";

// The first respawn still to come among the outcrops mined at the given moments, which is the next moment the standing
// Ones change with no draw and no strike to cause it, so whoever caches the standing list works it out again by then
export const computeNextMiningOutcropRespawn = (
  minedAts: Iterable<Temporal.Instant>,
  now: Temporal.Instant,
): Temporal.Instant | undefined => {
  let next: Temporal.Instant | undefined;
  for (const minedAt of minedAts) {
    const respawnAt = computeMiningOutcropRespawn(minedAt);
    if (
      Temporal.Instant.compare(respawnAt, now) > 0 &&
      (next === undefined || Temporal.Instant.compare(respawnAt, next) < 0)
    )
      next = respawnAt;
  }
  return next;
};
