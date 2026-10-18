import { computeRiverCourses } from "#src/services/genshinAssets/fit/computeRiverCourses";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

// Two banks a metre either side of a centreline along x, the level falling half a metre a metre from the head
const strip = (fromX: number, toX: number): Vector3[] =>
  Array.from({ length: toX - fromX + 1 }, (_, index) => fromX + index).flatMap((x) =>
    [-1, 1].map((z) => new Vector3(x, 10 - x / 2, z)),
  );

describe(computeRiverCourses, () => {
  test("a river's ribbon follows the game's centreline", () => {
    expect.hasAssertions();

    expect(computeRiverCourses(strip(0, 6))).toStrictEqual([
      Array.from({ length: 7 }, (_, x) => ({ level: 10 - x / 2, width: 2, x, z: 0 })),
    ]);
  });

  test("a river's course breaks where its surface has a hole, rather than bridging it", () => {
    expect.hasAssertions();

    expect(computeRiverCourses([...strip(0, 6), ...strip(17, 23)])).toStrictEqual([
      Array.from({ length: 7 }, (_, x) => ({ level: 10 - x / 2, width: 2, x, z: 0 })),
      Array.from({ length: 7 }, (_, index) => ({ level: 10 - (17 + index) / 2, width: 2, x: 17 + index, z: 0 })),
    ]);
  });

  test("a water surface no longer than twice its width is a pond, not a river", () => {
    expect.hasAssertions();

    const pond = [0, 4].flatMap((x) => [0, 4].map((z) => new Vector3(x, 0, z)));

    expect(computeRiverCourses(pond)).toStrictEqual([]);
  });
});
