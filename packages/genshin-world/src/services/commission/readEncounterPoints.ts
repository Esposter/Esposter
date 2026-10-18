import type { EncounterPoints } from "#src/models/commission/EncounterPoints";

import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";

// The Encounter Points held at `now`: those earned before the latest daily reset are gone with it, so none are held and
// They count from that reset
export const readEncounterPoints = (points: EncounterPoints, now: Temporal.Instant): EncounterPoints => {
  const dailyReset = computeLastDailyReset(now);
  return Temporal.Instant.compare(points.earnedOn, dailyReset) < 0 ? { earnedOn: dailyReset, halfPoints: 0 } : points;
};
