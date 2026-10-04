import { fitSilhouette } from "#src/services/genshinAssets/fit/fitSilhouette";
import { describe, expect, test } from "vitest";

type Triangle = [[number, number], [number, number], [number, number]];

// A rectangle as the two triangles a mesh draws it with
const createRectangle = (left: number, bottom: number, right: number, top: number): Triangle[] => [
  [
    [left, bottom],
    [right, bottom],
    [right, top],
  ],
  [
    [left, bottom],
    [right, top],
    [left, top],
  ],
];
const getSignedArea = (loop: [number, number][]): number =>
  loop.reduce((sum, [x, y], index) => {
    const [nextX, nextY] = loop[(index + 1) % loop.length] ?? [x, y];
    return sum + (x * nextY - nextX * y) / 2;
  }, 0);
const toSortedCorners = (loop: [number, number][]): string[] => loop.map(([x, y]) => `${x},${y}`).toSorted();

describe(fitSilhouette, () => {
  const cellSize = 1;
  const tolerance = 0.01;

  test("traces a frame as its outer ring, counterclockwise, and its hole, clockwise, each by its corners", () => {
    expect.hasAssertions();

    const loops = fitSilhouette(
      [
        ...createRectangle(0, 0, 4, 1),
        ...createRectangle(0, 3, 4, 4),
        ...createRectangle(0, 1, 1, 3),
        ...createRectangle(3, 1, 4, 3),
      ],
      { cellSize, tolerance },
    ).toSorted((firstLoop, secondLoop) => getSignedArea(secondLoop) - getSignedArea(firstLoop));

    expect(loops.map((loop) => getSignedArea(loop))).toStrictEqual([16, -4]);
    expect(loops.map((loop) => toSortedCorners(loop))).toStrictEqual([
      ["0,0", "0,4", "4,0", "4,4"],
      ["1,1", "1,3", "3,1", "3,3"],
    ]);
  });
});
