import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";

import { readLongTermEncounterPoints } from "#src/services/commission/readLongTermEncounterPoints";
import { describe, expect, test } from "vitest";

describe(readLongTermEncounterPoints, () => {
  const MAJOR_VERSION = 6;

  test("should read the points held in the current major version as they are", () => {
    expect.hasAssertions();
    const points: LongTermEncounterPoints = { halfPoints: 6, majorVersion: MAJOR_VERSION };

    expect(readLongTermEncounterPoints(points, MAJOR_VERSION)).toStrictEqual(points);
  });

  test("should read the points earned in an earlier major version as none", () => {
    expect.hasAssertions();

    expect(
      readLongTermEncounterPoints({ halfPoints: 6, majorVersion: MAJOR_VERSION - 1 }, MAJOR_VERSION),
    ).toStrictEqual({ halfPoints: 0, majorVersion: MAJOR_VERSION });
  });
});
