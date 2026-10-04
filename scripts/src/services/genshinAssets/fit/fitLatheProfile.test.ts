import { fitLatheProfile } from "#src/services/genshinAssets/fit/fitLatheProfile";
import { describe, expect, test } from "vitest";

// A ring of four points at a radius and a height, about an axis at (10, 20)
const ring = (radius: number, y: number): [number, number, number][] => [
  [10 + radius, y, 20],
  [10 - radius, y, 20],
  [10, y, 20 + radius],
  [10, y, 20 - radius],
];
describe(fitLatheProfile, () => {
  const bandHeight = 1;
  const tolerance = 0.1;

  test("finds its axis and foot, and merges bands whose radius holds into one section", () => {
    expect.hasAssertions();

    const { axis, foot, sections } = fitLatheProfile([...ring(2, 5), ...ring(2, 6), ...ring(1, 7), ...ring(1, 8)], {
      bandHeight,
      tolerance,
    });

    expect(axis).toStrictEqual([10, 20]);
    expect(foot).toBe(5);
    expect(sections).toStrictEqual([
      { bottomRadius: 2, height: 2, topRadius: 2 },
      { bottomRadius: 1, height: 1, topRadius: 1 },
    ]);
  });

  test("keeps a band with no vertex of its own at the radius below it", () => {
    expect.hasAssertions();

    const { sections } = fitLatheProfile([...ring(2, 0), ...ring(2, 4)], { bandHeight, tolerance });

    expect(sections).toStrictEqual([{ bottomRadius: 2, height: 4, topRadius: 2 }]);
  });
});
