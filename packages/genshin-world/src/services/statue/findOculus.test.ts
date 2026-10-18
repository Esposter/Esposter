import { OCULUS_ADVENTURE_EXP } from "#src/services/statue/constants";
import { findOculus } from "#src/services/statue/findOculus";
import { describe, expect, test } from "vitest";

describe(findOculus, () => {
  const OCULUS_ID = "1";

  test("touching an Oculus collects it and gives Adventure EXP", () => {
    expect.hasAssertions();

    expect(findOculus(new Set(), OCULUS_ID, 0)).toStrictEqual({
      adventureExp: OCULUS_ADVENTURE_EXP,
      collectedCount: 1,
      foundOculusIds: new Set([OCULUS_ID]),
    });
  });

  test("a collected Oculus is held in its region with the ones already collected", () => {
    expect.hasAssertions();

    expect(findOculus(new Set(), OCULUS_ID, 2)).toStrictEqual({
      adventureExp: OCULUS_ADVENTURE_EXP,
      collectedCount: 3,
      foundOculusIds: new Set([OCULUS_ID]),
    });
  });

  test("a collected Oculus does not come back", () => {
    expect.hasAssertions();
    const foundOculusIds = new Set([OCULUS_ID]);

    expect(findOculus(foundOculusIds, OCULUS_ID, 1)).toStrictEqual({
      adventureExp: 0,
      collectedCount: 1,
      foundOculusIds,
    });
  });
});
