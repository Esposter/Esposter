import { COOKING_POINTER_SWEEP_SECONDS } from "#src/services/cooking/constants";
import { getCookingPointerPosition } from "#src/services/cooking/getCookingPointerPosition";
import { describe, expect, test } from "vitest";

describe(getCookingPointerPosition, () => {
  test("the indicator sweeps from one end of its bar to the other and back", () => {
    expect.hasAssertions();

    const positions = [0, 0.5, 1, 1.5, 2].map((sweeps) =>
      getCookingPointerPosition(sweeps * COOKING_POINTER_SWEEP_SECONDS),
    );

    expect(positions.map((position) => Math.round(position * 1000) / 1000)).toStrictEqual([0, 0.5, 1, 0.5, 0]);
  });

  test("a time before the start stands the indicator at the left end", () => {
    expect.hasAssertions();

    expect(getCookingPointerPosition(-COOKING_POINTER_SWEEP_SECONDS)).toBe(0);
  });
});
