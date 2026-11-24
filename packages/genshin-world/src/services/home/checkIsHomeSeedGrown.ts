import type { HomePlant } from "#src/models/home/HomePlant";

// Whether a seed planted at `plantedAt` is a crop at `now`: its plant's seconds have passed since it was planted. A
// Moment before the planting, from a clock set back, is not grown
export const checkIsHomeSeedGrown = (plant: HomePlant, plantedAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  now.since(plantedAt).total({ unit: "second" }) >= plant.seconds;
