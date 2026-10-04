import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { fitFootprintOutline } from "#src/services/genshinAssets/fit/fitFootprintOutline";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { WALKWAY_CELL_SIZE, WALKWAY_OUTLINE_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { join } from "node:path";

// Every piece the walkway is laid from: its paving, its borders and its wings
const WALKWAY_MESH_REGEX = /^LoginScene_Bridge01_\d+_Vo$/u;
// The walkway as the slabs it is laid from, each piece's outline seen from above and its own top (a few sit a little
// Under the rest), every piece rising into place on its own as the walkway assembles itself ahead of the camera; and
// The surface's and underside's heights, the levels most of its vertices lie at at its top and its foot
export const fitLoginWalkway = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ bottom: number; pieces: { outline: [number, number][]; top: number }[]; top: number }> => {
  const heightCounts = new Map<number, number>();
  const pieces: { outline: [number, number][]; top: number }[] = [];
  for (const placement of placements
    .filter(({ mesh }) => WALKWAY_MESH_REGEX.test(mesh))
    .toSorted((firstPlacement, secondPlacement) => firstPlacement.mesh.localeCompare(secondPlacement.mesh))) {
    // oxlint-disable-next-line no-await-in-loop -- one small piece is read at a time
    const { faces, vertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
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
    pieces.push({ outline, top: roundFitted(Math.max(...world.map(([, y]) => y))) });
  }
  // The two most common heights, the surface above the underside
  const [first = 0, second = 0] = [...heightCounts.entries()].toSorted(([, a], [, b]) => b - a).map(([y]) => y);
  return { bottom: Math.min(first, second), pieces, top: Math.max(first, second) };
};
