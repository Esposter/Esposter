import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { WALKWAY_CELL_SIZE, WALKWAY_OUTLINE_TOLERANCE } from "#src/services/genshinAssets/constants";
import { fitFootprintOutline } from "#src/services/genshinAssets/fitFootprintOutline";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { toWorldVertices } from "#src/services/genshinAssets/toWorldVertices";
import { join } from "node:path";

// Every piece the walkway is laid from: its paving, its borders and its wings
const WALKWAY_MESH_REGEX = /^LoginScene_Bridge01_\d+_Vo$/u;
// The walkway as a slab: the outline its pieces cover from above, and its surface's and underside's heights, the
// Levels most of its vertices lie at at its top and its foot
export const fitLoginWalkway = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ bottom: number; outline: [number, number][]; top: number }> => {
  const triangles: [[number, number], [number, number], [number, number]][] = [];
  const heightCounts = new Map<number, number>();
  for (const placement of placements.filter(({ mesh }) => WALKWAY_MESH_REGEX.test(mesh))) {
    // oxlint-disable-next-line no-await-in-loop -- one small piece is read at a time
    const { faces, vertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
    const world = toWorldVertices(vertices, placement);
    for (const [, y] of world) heightCounts.set(roundFitted(y), (heightCounts.get(roundFitted(y)) ?? 0) + 1);
    for (const [first, second, third] of faces) {
      const a = world[first];
      const b = world[second];
      const c = world[third];
      if (a && b && c)
        triangles.push([
          [a[0], a[2]],
          [b[0], b[2]],
          [c[0], c[2]],
        ]);
    }
  }
  // The two most common heights, the surface above the underside
  const [first = 0, second = 0] = [...heightCounts.entries()].toSorted(([, a], [, b]) => b - a).map(([y]) => y);
  const outline = fitFootprintOutline(triangles, {
    cellSize: WALKWAY_CELL_SIZE,
    tolerance: WALKWAY_OUTLINE_TOLERANCE,
  }).map(([x, z]): [number, number] => {
    const [rightHandedX, , rightHandedZ] = toRightHanded([x, 0, z]);
    return [roundFitted(rightHandedX), roundFitted(rightHandedZ)];
  });
  return { bottom: Math.min(first, second), outline, top: Math.max(first, second) };
};
