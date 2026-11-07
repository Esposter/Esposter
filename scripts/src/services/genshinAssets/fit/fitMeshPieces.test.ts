import type { Vector } from "#src/models/shared/Vector";

import { fitMeshPieces } from "#src/services/genshinAssets/fit/fitMeshPieces";
import { STATUE_ANGLE_COUNT, STATUE_BLADE_ANGLE_COUNT } from "#src/services/genshinAssets/shared/constants";
import { describe, expect, test } from "vitest";

// A box of the given size about the origin: its eight corners and twelve triangles
const toBox = (width: number, length: number, thickness: number): { faces: Vector[]; vertices: Vector[] } => ({
  faces: [
    [0, 1, 2],
    [0, 2, 3],
    [4, 6, 5],
    [4, 7, 6],
    [0, 4, 5],
    [0, 5, 1],
    [1, 5, 6],
    [1, 6, 2],
    [2, 6, 7],
    [2, 7, 3],
    [3, 7, 4],
    [3, 4, 0],
  ],
  vertices: [
    [-width / 2, 0, -thickness / 2],
    [width / 2, 0, -thickness / 2],
    [width / 2, length, -thickness / 2],
    [-width / 2, length, -thickness / 2],
    [-width / 2, 0, thickness / 2],
    [width / 2, 0, thickness / 2],
    [width / 2, length, thickness / 2],
    [-width / 2, length, thickness / 2],
  ],
});

describe(fitMeshPieces, () => {
  const readFaceColour = (): Vector => [1, 1, 1];
  // A piece is read as twenty thousand surface points and every candidate fit is scored, which outruns the default
  const FIT_TIMEOUT_MS = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");

  test("A thin blade is fitted as blades, not one stack", { timeout: FIT_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const { faces, vertices } = toBox(0.04, 1, 0.004);
    const [piece, ...others] = fitMeshPieces(vertices, faces, readFaceColour);

    expect(others).toHaveLength(0);
    expect(piece?.stacks.length).toBeGreaterThan(0);
    expect(
      piece?.stacks.flatMap(({ sections }) => sections).every(({ radii }) => radii.length === STATUE_BLADE_ANGLE_COUNT),
    ).toBe(true);
    expect(
      piece?.stacks.some(({ sections }) => sections.some(({ radii }) => radii.length === STATUE_ANGLE_COUNT)),
    ).toBe(false);
  });
});
