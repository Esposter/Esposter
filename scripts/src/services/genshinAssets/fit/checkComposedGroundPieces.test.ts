import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { RegionGround } from "genshin-world";

import { checkComposedGroundPieces } from "#src/services/genshinAssets/fit/checkComposedGroundPieces";
import { describe, expect, test } from "vitest";

const createSquare = (minX: number, maxX: number) => [
  { x: minX, z: 0 },
  { x: maxX, z: 0 },
  { x: maxX, z: 200 },
  { x: minX, z: 200 },
];
const createFit = (key: string, height: number, x: number): GroundPieceFit => ({
  build: { notes: [], objects: {} },
  isHeld: true,
  key,
  measure: { gate: 1, ground: { base: height, features: [], hills: [] }, samples: [{ height, x, z: 100 }] },
  sampleCount: 1,
});

describe(checkComposedGroundPieces, () => {
  test("reads a sample in a seam's band at the height the world draws there, not at its own piece's surface", () => {
    expect.hasAssertions();

    const base: [RegionGround] = [{ base: 24, features: [], hills: [] }];
    const region = {
      areas: [
        { id: "a", outline: createSquare(0, 200) },
        { id: "b", outline: createSquare(200, 400) },
      ],
      id: "fontaine",
    };
    const fits = [createFit("ground/fontaine/a", 50, 199), createFit("ground/fontaine/b", 250, 201)];

    expect(
      checkComposedGroundPieces(base, region, fits).map(({ bar, fit, isHeld }) => ({ bar, isHeld, key: fit.key })),
    ).toStrictEqual([
      { bar: 71.33, isHeld: false, key: "ground/fontaine/a" },
      { bar: 71.33, isHeld: false, key: "ground/fontaine/b" },
    ]);
  });
});
