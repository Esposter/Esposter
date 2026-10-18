import type { Expedition } from "#src/models/expedition/Expedition";

const HOUR_MILLISECONDS = 3_600_000;

// Whether an expedition has its time out at `now`: the moment it left, moved on by the hours it was sent for less the
// Percent of them a talent saves (none by default), is reached
export const checkIsExpeditionReturned = (
  expedition: Expedition,
  now: Temporal.Instant,
  timeReductionPercent = 0,
): boolean =>
  Temporal.Instant.compare(
    expedition.leftAt.add({
      milliseconds: Math.round((expedition.hours * HOUR_MILLISECONDS * (100 - timeReductionPercent)) / 100),
    }),
    now,
  ) <= 0;
