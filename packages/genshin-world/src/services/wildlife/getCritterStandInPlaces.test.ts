import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

import { getCritterStandInPlaces } from "#src/services/wildlife/getCritterStandInPlaces";
import { describe, expect, test } from "vitest";

describe(getCritterStandInPlaces, () => {
  const CRAB_KIND = 1001;
  const BUTTERFLY_KIND = 1002;
  const crabA: MaterialSourcePlace = { id: "crab-a", kind: CRAB_KIND, position: { x: 1, z: 2 } };
  const crabB: MaterialSourcePlace = { id: "crab-b", kind: CRAB_KIND, position: { x: 3, z: 4 } };
  const butterfly: MaterialSourcePlace = { id: "butterfly", kind: BUTTERFLY_KIND, position: { x: 5, z: 6 } };

  test("a critter stands at each of its points", () => {
    expect.hasAssertions();

    expect(getCritterStandInPlaces([crabA, crabB], new Set())).toStrictEqual([crabA, crabB]);
  });

  test("a butterfly stands at no point", () => {
    expect.hasAssertions();

    expect(getCritterStandInPlaces([crabA, butterfly, crabB], new Set([BUTTERFLY_KIND]))).toStrictEqual([crabA, crabB]);
  });
});
