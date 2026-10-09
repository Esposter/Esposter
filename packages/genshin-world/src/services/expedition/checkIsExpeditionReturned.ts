import type { Expedition } from "#src/models/expedition/Expedition";

// Whether an expedition has its time out at `now`: the moment it left, moved on by the hours it was sent for, is reached
export const checkIsExpeditionReturned = (expedition: Expedition, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(expedition.leftAt.add({ hours: expedition.hours }), now) <= 0;
