import { computeModulo } from "#src/services/function/computeModulo";
import { describe, expect, test } from "vitest";

describe(computeModulo, () => {
  test("A modulo of a large dividend keeps its exact residue", () => {
    expect.hasAssertions();

    expect(computeModulo(1e18, 7)).toBe(1);
  });
});
