import { readEncounterPoints } from "#src/services/commission/readEncounterPoints";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(readEncounterPoints, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const dailyReset = epoch.subtract({ hours: GAME_DAY_START_HOUR });
  const now = dailyReset.add({ hours: 12 });

  test("points earned before the daily reset are gone, and the day counts from that reset", () => {
    expect.hasAssertions();
    const points = readEncounterPoints({ earnedOn: dailyReset.subtract({ minutes: 1 }), halfPoints: 6 }, now);
    expect(points.earnedOn.equals(dailyReset)).toBe(true);
    expect(points.halfPoints).toBe(0);
  });

  test("points earned at or after the daily reset are held as they are", () => {
    expect.hasAssertions();
    const points = { earnedOn: dailyReset, halfPoints: 6 };
    expect(readEncounterPoints(points, now)).toBe(points);
  });
});
