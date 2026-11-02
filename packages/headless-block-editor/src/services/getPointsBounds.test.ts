import type { Point } from "#src/models/Point";

import { getPointsBounds } from "#src/services/getPointsBounds";
import { describe, expect, test } from "vitest";

describe(getPointsBounds, () => {
  test("a stroke of more points than a call takes as arguments still has its bounds", () => {
    expect.hasAssertions();

    const points: Point[] = Array.from({ length: 500_000 }, (_value, index) => ({ x: index, y: -index }));

    expect(getPointsBounds(points)).toStrictEqual({ height: 499_999, width: 499_999, x: 0, y: -499_999 });
  });
});
