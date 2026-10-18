import { getZoomedScroll } from "#src/services/getZoomedScroll";
import { describe, expect, test } from "vitest";

describe(getZoomedScroll, () => {
  const SCROLL = 100;
  const POINT = 40;
  const RATIO = 2;

  test("keeping the content under the point in place", () => {
    expect.hasAssertions();

    const scroll = getZoomedScroll({ point: POINT, ratio: RATIO, scroll: SCROLL });

    // The content under the point sat 140 in, which doubles to 280, and the point's 40 is taken back off
    expect(scroll).toBe(240);
  });
});
