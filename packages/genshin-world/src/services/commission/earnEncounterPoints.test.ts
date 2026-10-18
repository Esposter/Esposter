import { earnEncounterPoints } from "#src/services/commission/earnEncounterPoints";
import { describe, expect, test } from "vitest";

describe(earnEncounterPoints, () => {
  const earnedOn = Temporal.Instant.fromEpochMilliseconds(0);

  test("points earned are held up to the storage", () => {
    expect.hasAssertions();
    expect(earnEncounterPoints({ earnedOn, halfPoints: 2 }, 8, 6).halfPoints).toBe(6);
  });

  test("points already held stay when the storage has shrunk below them", () => {
    expect.hasAssertions();
    expect(earnEncounterPoints({ earnedOn, halfPoints: 6 }, 2, 4).halfPoints).toBe(6);
  });
});
