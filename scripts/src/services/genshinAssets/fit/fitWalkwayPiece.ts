import type { LoginWalkwayPiece } from "#src/models/genshinAssets/fit/LoginWalkwayPiece";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { findCellComponents } from "#src/services/genshinAssets/fit/findCellComponents";
import { fitFootprintOutline } from "#src/services/genshinAssets/fit/fitFootprintOutline";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import {
  WALKWAY_CELL_SIZE,
  WALKWAY_OUTLINE_TOLERANCE,
  WALKWAY_RAISED_DECIMALS,
  WALKWAY_RAISED_HEIGHT,
  WALKWAY_RAISED_MIN_CELLS,
} from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { computeUpperMedian } from "#src/services/recreation/statistics/computeUpperMedian";
import { join } from "node:path";

// A piece's tops read from above on a centimetre grid
const TOP_CELL_SIZE = 0.01;

// Reads one walkway placement's mesh and fits it to its piece, so the mesh is released once its piece is written.
// `heightCounts` is how many of the mesh's vertices lie at each rounded height, for the walkway's two levels
export const fitWalkwayPiece = async (
  placement: AssetPlacement,
  meshDirectory: string,
): Promise<{ heightCounts: Map<number, number>; piece: LoginWalkwayPiece }> => {
  const { faces, vertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
  const heightCounts = new Map<number, number>();
  const world = toWorldVertices(vertices, placement);
  for (const [, y] of world) heightCounts.set(roundFitted(y), (heightCounts.get(roundFitted(y)) ?? 0) + 1);
  const triangles = faces.flatMap(([first, second, third]) => {
    const a = world[first];
    const b = world[second];
    const c = world[third];
    return a && b && c
      ? [
          [
            [a[0], a[2]],
            [b[0], b[2]],
            [c[0], c[2]],
          ] as [[number, number], [number, number], [number, number]],
        ]
      : [];
  });
  const outline = fitFootprintOutline(triangles, {
    cellSize: WALKWAY_CELL_SIZE,
    tolerance: WALKWAY_OUTLINE_TOLERANCE,
  }).map(([x, z]): [number, number] => {
    const [rightHandedX, , rightHandedZ] = toRightHanded([x, 0, z]);
    return [roundFitted(rightHandedX), roundFitted(rightHandedZ)];
  });
  const xs = world.map(([x]) => x);
  const zs = world.map((vertex) => vertex[2]);
  const corner: [number, number] = [Math.min(...xs), Math.min(...zs)];
  const rasterWidth = Math.ceil((Math.max(...xs) - corner[0]) / TOP_CELL_SIZE);
  const { heights } = rasterizeTopFaces(
    faces.flatMap(([first, second, third]) => {
      const [a, b, c] = [world[first], world[second], world[third]];
      return a && b && c
        ? [
            {
              corners: [a, b, c],
              tag: 0,
              values: [
                [0, 0],
                [0, 0],
                [0, 0],
              ],
            },
          ]
        : [];
    }),
    {
      cellSize: TOP_CELL_SIZE,
      corner,
      height: Math.ceil((Math.max(...zs) - corner[1]) / TOP_CELL_SIZE),
      width: rasterWidth,
    },
  );
  const topCountMap = new Map<number, number>();
  for (const value of heights)
    if (Number.isFinite(value)) topCountMap.set(roundFitted(value), (topCountMap.get(roundFitted(value)) ?? 0) + 1);
  const [[top] = [0]] = [...topCountMap].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount);
  const raisedCells: number[] = [];
  for (const [cell, value] of heights.entries())
    if (Number.isFinite(value) && value >= top + WALKWAY_RAISED_HEIGHT) raisedCells.push(cell);
  const raised = findCellComponents(raisedCells, { width: rasterWidth }).flatMap((component) => {
    const raisedTop = roundFitted(
      computeUpperMedian(component.map((cell) => heights[cell] ?? 0)),
      WALKWAY_RAISED_DECIMALS,
    );
    return traceCellLoops(component, {
      cellSize: TOP_CELL_SIZE,
      corner,
      minCells: WALKWAY_RAISED_MIN_CELLS,
      tolerance: 1,
      width: rasterWidth,
    }).map((loop) => ({
      outline: loop.map(([x, z]): [number, number] => {
        const [rightHandedX, , rightHandedZ] = toRightHanded([x, 0, z]);
        return [roundFitted(rightHandedX), roundFitted(rightHandedZ)];
      }),
      top: raisedTop,
    }));
  });
  return { heightCounts, piece: { outline, raised, top } };
};
