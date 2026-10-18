import type { EncounterPoints } from "#src/models/commission/EncounterPoints";

import { computeEncounterPointOverflow } from "#src/services/commission/computeEncounterPointOverflow";
import { describe, expect, test } from "vitest";

describe(computeEncounterPointOverflow, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const STORAGE = 8;
  const pointsOf = (halfPoints: number): EncounterPoints => ({ earnedOn: EPOCH, halfPoints });

  test("should turn away none where the storage takes the whole earn", () => {
    expect.hasAssertions();

    expect(computeEncounterPointOverflow(pointsOf(0), 4, STORAGE)).toBe(0);
  });

  test("should turn away the earn past the storage", () => {
    expect.hasAssertions();

    expect(computeEncounterPointOverflow(pointsOf(4), 8, STORAGE)).toBe(4);
  });

  test("should turn away the whole earn where the held points already fill the storage", () => {
    expect.hasAssertions();

    expect(computeEncounterPointOverflow(pointsOf(STORAGE), 8, STORAGE)).toBe(8);
  });

  test("should turn away the whole earn past a storage that has shrunk below the held points", () => {
    expect.hasAssertions();

    expect(computeEncounterPointOverflow(pointsOf(6), 2, 4)).toBe(2);
  });
});
