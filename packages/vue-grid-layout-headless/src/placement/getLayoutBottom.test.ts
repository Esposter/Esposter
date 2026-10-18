import { getLayoutBottom } from "#src/placement/getLayoutBottom";
import { describe, expect, test } from "vitest";

describe(getLayoutBottom, () => {
  test("is the row the lowest item ends on", () => {
    expect.hasAssertions();

    expect(
      getLayoutBottom([
        { h: 2, id: "a", w: 1, x: 0, y: 0 },
        { h: 1, id: "b", w: 1, x: 0, y: 3 },
      ]),
    ).toBe(4);
  });

  test("is zero for an empty layout", () => {
    expect.hasAssertions();

    expect(getLayoutBottom([])).toBe(0);
  });
});
