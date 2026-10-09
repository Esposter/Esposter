import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { computeShownResidentSpot } from "#src/services/resident/computeShownResidentSpot";
import { describe, expect, test } from "vitest";

describe(computeShownResidentSpot, () => {
  const DAY_SPOT: ResidentSpot = { position: { x: 1, z: 2 }, rotation: 0 };
  const NIGHT_SPOT: ResidentSpot = { position: { x: 3, z: 4 }, rotation: 1 };

  test("moves to the spot the clock gives when the resident is out of view", () => {
    expect.hasAssertions();
    expect(computeShownResidentSpot(DAY_SPOT, NIGHT_SPOT, false)).toStrictEqual(NIGHT_SPOT);
    expect(computeShownResidentSpot(DAY_SPOT, undefined, false)).toBeUndefined();
  });

  test("holds the spot it stands at while the resident is in view", () => {
    expect.hasAssertions();
    expect(computeShownResidentSpot(DAY_SPOT, NIGHT_SPOT, true)).toStrictEqual(DAY_SPOT);
    expect(computeShownResidentSpot(undefined, NIGHT_SPOT, true)).toBeUndefined();
  });

  test("keeps the spot it stands at when the clock gives the same one", () => {
    expect.hasAssertions();
    expect(computeShownResidentSpot(DAY_SPOT, DAY_SPOT, true)).toStrictEqual(DAY_SPOT);
  });
});
