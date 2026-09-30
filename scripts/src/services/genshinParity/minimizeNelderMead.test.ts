import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { describe, expect, test } from "vitest";

describe(minimizeNelderMead, () => {
  test("reaches a bowl's lowest point from a start away from it", async () => {
    expect.hasAssertions();

    const { point } = await minimizeNelderMead(
      ([x = 0, y = 0]) => Promise.resolve((x - 1) ** 2 + (y + 2) ** 2),
      [0, 0],
      [1, 1],
      200,
    );

    expect(point[0]).toBeCloseTo(1);
    expect(point[1]).toBeCloseTo(-2);
  });
});
