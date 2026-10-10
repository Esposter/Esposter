import { traceTubeCentrelines } from "#src/services/genshinAssets/fit/traceTubeCentrelines";
import { describe, expect, test } from "vitest";

describe(traceTubeCentrelines, () => {
  test("traces a tapering tube from its open end's centre to its tip, simplified to the line it runs along", () => {
    expect.hasAssertions();

    // A cone four metres tall on a square ring of a metre's radius, open at its foot and closed on its tip
    expect(
      traceTubeCentrelines(
        [
          [1, 0, 0],
          [0, 0, 1],
          [-1, 0, 0],
          [0, 0, -1],
          [0, 4, 0],
        ],
        [
          [0, 1, 4],
          [1, 2, 4],
          [2, 3, 4],
          [3, 0, 4],
        ],
        { hasTrunk: false, levelStep: 0.5, tolerance: 0.01 },
      ),
    ).toStrictEqual([
      [
        { radius: 1, x: 0, y: 0, z: 0 },
        { radius: 0, x: 0, y: 4, z: 0 },
      ],
    ]);
  });

  test("traces a trunk from its foot, over a hole in its bark, to its tip", () => {
    expect.hasAssertions();

    // A square trunk standing on its capped foot, a metre's radius two metres up and closed on a tip four metres up, one
    // Side of its lower storey left open as a hole
    const vertices: [number, number, number][] = [
      [1, 0, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, 0, -1],
      [1, 2, 0],
      [0, 2, 1],
      [-1, 2, 0],
      [0, 2, -1],
      [0, 0, 0],
      [0, 4, 0],
    ];
    const footFaces = [0, 1, 2, 3].map((side): [number, number, number] => [8, (side + 1) % 4, side]);
    const sideFaces = [1, 2, 3].flatMap((side): [number, number, number][] => [
      [side, (side + 1) % 4, side + 4],
      [(side + 1) % 4, ((side + 1) % 4) + 4, side + 4],
    ]);
    const tipFaces = [4, 5, 6, 7].map((side): [number, number, number] => [side, ((side + 1) % 4) + 4, 9]);

    expect(
      traceTubeCentrelines(vertices, [...footFaces, ...sideFaces, ...tipFaces], {
        hasTrunk: true,
        levelStep: 0.5,
        tolerance: 1,
      }),
    ).toStrictEqual([
      [
        { radius: 0.8, x: 0, y: 0, z: 0 },
        { radius: 0, x: 0, y: 4, z: 0 },
      ],
    ]);
  });
});
