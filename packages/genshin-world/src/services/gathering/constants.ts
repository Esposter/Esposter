// A local specialty comes back this long after it is picked, as the wiki gives it
export const SPECIALTY_RESPAWN_DURATION: Temporal.Duration = Temporal.Duration.from({ hours: 46 });
// How often the open world looks at the clock for a picked point that has come back, which it reads at each look
export const GATHERING_CLOCK_INTERVAL_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// An ore comes back this long after it breaks: a White Iron Chunk or Starsilver after two days, a Crystal Chunk away from
// A mining outcrop after three, as the wiki's Reset page gives them
export const ORE_TWO_DAYS_RESPAWN_DURATION: Temporal.Duration = Temporal.Duration.from({ hours: 48 });
export const ORE_THREE_DAYS_RESPAWN_DURATION: Temporal.Duration = Temporal.Duration.from({ hours: 72 });
// An ore drops one piece for certain, and one more for each of its extra draws that comes under the chance
export const ORE_CERTAIN_DROP_COUNT = 1;
export const ORE_EXTRA_DROP_DRAW_COUNT = 2;
export const ORE_EXTRA_DROP_CHANCE = 0.1;
