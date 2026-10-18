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
// The mining outcrops a region's daily reset draws, as the wiki gives them for three regions. A region the wiki gives no
// Count for draws the default, which is Mondstadt's, until the game's count is read. Provisional
export const MINING_OUTCROP_DAILY_COUNT_MAP: Readonly<Record<string, number>> = { inazuma: 8, liyue: 10, mondstadt: 6 };
export const MINING_OUTCROP_DEFAULT_DAILY_COUNT = 6;
// The stand-in a mining outcrop is drawn as until the game's rock kit is read: a crystal's blue, and a radius in metres
export const MINING_OUTCROP_STAND_IN_COLOR = 0x9fd6e8;
export const MINING_OUTCROP_STAND_IN_RADIUS = 0.5;
