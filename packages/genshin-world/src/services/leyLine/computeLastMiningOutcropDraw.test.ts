import { computeLastMiningOutcropDraw } from "#src/services/leyLine/computeLastMiningOutcropDraw";
import { MINING_OUTCROP_RESPAWN } from "#src/services/leyLine/constants.test";
import { GAME_TIME_ZONE, MINING_OUTCROP_REFRESH_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeLastMiningOutcropDraw, () => {
  // The 06:00 a day before the one the leyLine constants give, which stands from the 04:00 reset until the next 06:00
  const previousDraw = MINING_OUTCROP_RESPAWN.subtract({ hours: 24 });

  test("a moment at 06:00 has that day's draw as its last", () => {
    expect.hasAssertions();

    const draw = computeLastMiningOutcropDraw(MINING_OUTCROP_RESPAWN);

    expect(draw.toString()).toBe(MINING_OUTCROP_RESPAWN.toString());
    expect(draw.toZonedDateTimeISO(GAME_TIME_ZONE).hour).toBe(MINING_OUTCROP_REFRESH_HOUR);
  });

  test("the instant just before 06:00 belongs to the previous day's draw", () => {
    expect.hasAssertions();

    expect(computeLastMiningOutcropDraw(MINING_OUTCROP_RESPAWN.subtract({ minutes: 1 })).toString()).toBe(
      previousDraw.toString(),
    );
  });

  test("the day's 03:59, before the 04:00 reset, still has the previous day's draw as its last", () => {
    expect.hasAssertions();

    expect(computeLastMiningOutcropDraw(MINING_OUTCROP_RESPAWN.subtract({ hours: 2, minutes: 1 })).toString()).toBe(
      previousDraw.toString(),
    );
  });
});
