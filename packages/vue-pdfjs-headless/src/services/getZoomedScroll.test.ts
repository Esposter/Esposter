import { getZoomedScroll } from "#src/services/getZoomedScroll";
import { describe, expect, test } from "vitest";

describe(getZoomedScroll, () => {
  const SCROLL = 100;
  const POINT = 40;
  const RATIO = 2;

  test("keeping the content under the point in place", () => {
    expect.hasAssertions();

    const scroll = getZoomedScroll({ point: POINT, ratio: RATIO, scroll: SCROLL });

    // The content under the point sat at the scroll plus the point, and that offset doubles with the scale
    expect(scroll + POINT).toBe((SCROLL + POINT) * RATIO);
  });
});
