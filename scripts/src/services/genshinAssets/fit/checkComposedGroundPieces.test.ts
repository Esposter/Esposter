import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { RegionGround } from "genshin-world";

import { checkComposedGroundPieces } from "#src/services/genshinAssets/fit/checkComposedGroundPieces";
import { createWorldHeight, toLaidGround } from "genshin-world";
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
    const [first] = checkComposedGroundPieces(base, region, fits);
    const worldHeight = createWorldHeight(base, [
      toLaidGround("ground/fontaine/a", { base: 50, features: [], hills: [] }, [region]),
      toLaidGround("ground/fontaine/b", { base: 250, features: [], hills: [] }, [region]),
    ]);

    expect(first?.isHeld).toBe(false);
    expect(first?.bar).toBeCloseTo(Math.abs(worldHeight(199, 100) - 50), 1);
  });
});
