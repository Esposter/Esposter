import { describe } from "vitest";

const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
// The epoch is eight in the morning in the game's time zone, four hours past that day's daily reset
export const DAILY_RESET = EPOCH.subtract({ hours: 4 });
export const NOW = DAILY_RESET.add({ hours: 1 });

describe.todo("constants");
