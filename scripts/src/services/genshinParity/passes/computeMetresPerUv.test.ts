import { computeMetresPerUv } from "#src/services/genshinParity/passes/computeMetresPerUv";
import { describe, expect, test } from "vitest";

describe(computeMetresPerUv, () => {
  test("the metres a UV unit spans are the median over the triangles of the root of their area ratio", () => {
    expect.hasAssertions();

    expect(
      computeMetresPerUv([
        { uvArea: 1, worldArea: 4 },
        { uvArea: 1, worldArea: 9 },
        { uvArea: 1, worldArea: 16 },
      ]),
    ).toBe(3);
  });

  test("a triangle with no UV area says nothing about the scale and is left out", () => {
    expect.hasAssertions();

    expect(
      computeMetresPerUv([
        { uvArea: 0, worldArea: 100 },
        { uvArea: 1, worldArea: 4 },
        { uvArea: 1, worldArea: 16 },
      ]),
    ).toBe(3);
  });

  test("a mesh with no UV area reads no scale", () => {
    expect.hasAssertions();

    expect(computeMetresPerUv([{ uvArea: 0, worldArea: 4 }])).toBeUndefined();
  });
});
