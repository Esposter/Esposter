import { describe } from "vitest";

// Six o'clock on 1 January in UTC+8, two hours before the epoch, is when an outcrop mined an hour earlier comes back
export const MINING_OUTCROP_RESPAWN = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: 2 });

describe.todo("constants");
