import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";

import { earnLongTermEncounterPoints } from "#src/services/commission/earnLongTermEncounterPoints";
import { describe, expect, test } from "vitest";

describe(earnLongTermEncounterPoints, () => {
  const MAJOR_VERSION = 6;

  test("should add the points to those held in the current major version", () => {
    expect.hasAssertions();
    const points: LongTermEncounterPoints = { halfPoints: 2, majorVersion: MAJOR_VERSION };

    expect(earnLongTermEncounterPoints(points, 4, MAJOR_VERSION)).toStrictEqual({
      halfPoints: 6,
      majorVersion: MAJOR_VERSION,
    });
  });

  test("should keep none of the points held from an earlier major version", () => {
    expect.hasAssertions();

    expect(
      earnLongTermEncounterPoints({ halfPoints: 6, majorVersion: MAJOR_VERSION - 1 }, 2, MAJOR_VERSION),
    ).toStrictEqual({ halfPoints: 2, majorVersion: MAJOR_VERSION });
  });
});
