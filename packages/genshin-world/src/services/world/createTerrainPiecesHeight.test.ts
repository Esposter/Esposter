import type { GroundPoint, TerrainBounds } from "genshin-engine";

import { createTerrainPiecesHeight } from "#src/services/world/createTerrainPiecesHeight";
import { describe, expect, test } from "vitest";

const BASE = 24;
const BLEND_WIDTH = 6;

const createOutline = ({ maxX, maxZ, minX, minZ }: TerrainBounds): GroundPoint[] => [
  { x: minX, z: minZ },
  { x: maxX, z: minZ },
  { x: maxX, z: maxZ },
  { x: minX, z: maxZ },
];
const getBase = () => BASE;

describe(createTerrainPiecesHeight, () => {
  test("a point inside one piece's outline is that piece's surface, not the sum of the pieces laid over each other", () => {
    expect.hasAssertions();

    const first = { maxX: 200, maxZ: 200, minX: 0, minZ: 0 };
    const second = { maxX: 350, maxZ: 200, minX: 150, minZ: 0 };
    const getHeight = createTerrainPiecesHeight(
      getBase,
      [
        { domain: { outline: createOutline(first) }, getHeight: (x) => 50 + 0.1 * x },
        { domain: { outline: createOutline(second) }, getHeight: () => 250 },
      ],
      BLEND_WIDTH,
    );

    expect(getHeight(100, 100)).toBeCloseTo(60);
    expect(getHeight(250, 100)).toBeCloseTo(250);
  });

  test("the height is continuous across an outline's seam, and the base shows past the band", () => {
    expect.hasAssertions();

    const getHeight = createTerrainPiecesHeight(
      getBase,
      [{ domain: { outline: createOutline({ maxX: 200, maxZ: 200, minX: 0, minZ: 0 }) }, getHeight: () => 50 }],
      BLEND_WIDTH,
    );

    // A millimetre either side of the seam moves the blend by a few millimetres, so both sides read the seam's height
    expect(getHeight(199.999, 100)).toBeCloseTo(getHeight(200, 100), 1);
    expect(getHeight(200.001, 100)).toBeCloseTo(getHeight(200, 100), 1);
    expect(getHeight(100, 100)).toBeCloseTo(50);
    expect(getHeight(200 + BLEND_WIDTH + 1, 100)).toBeCloseTo(BASE);
  });

  test("the height is continuous across the seam of two quarters of one outline", () => {
    expect.hasAssertions();

    const outline = createOutline({ maxX: 200, maxZ: 200, minX: 0, minZ: 0 });
    const getHeight = createTerrainPiecesHeight(
      getBase,
      [
        { domain: { outline, squares: [{ maxX: 100, maxZ: 200, minX: 0, minZ: 0 }] }, getHeight: () => 10 },
        { domain: { outline, squares: [{ maxX: 200, maxZ: 200, minX: 100, minZ: 0 }] }, getHeight: () => 30 },
      ],
      BLEND_WIDTH,
    );

    expect(getHeight(99.999, 100)).toBeCloseTo(getHeight(100, 100), 1);
    expect(getHeight(100.001, 100)).toBeCloseTo(getHeight(100, 100), 1);
    expect(getHeight(50, 100)).toBeCloseTo(10);
    expect(getHeight(150, 100)).toBeCloseTo(30);
  });
});
