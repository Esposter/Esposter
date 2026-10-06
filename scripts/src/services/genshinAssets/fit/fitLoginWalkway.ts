import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { fitFootprintOutline } from "#src/services/genshinAssets/fit/fitFootprintOutline";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import {
  WALKWAY_CELL_SIZE,
  WALKWAY_MESH_REGEX,
  WALKWAY_OUTLINE_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { join } from "node:path";

// A piece's tops read from above on a centimetre grid
const TOP_CELL_SIZE = 0.01;
// The walkway as the slabs it is laid from, each piece's outline seen from above and the height its stone stands at,
// The one most of its tops stand at seen from above: its curbs and its lanes' borders stand a centimetre or three
// Over it, and a slab drawn up to them stood its whole top there, so the pieces of the middle lane, which carry no
// Curb, stood two centimetres under their neighbours. Every piece rises into place on its own as the walkway assembles
// Itself ahead of the camera; and
// The surface's and underside's heights, the levels most of its vertices lie at at its top and its foot
export const fitLoginWalkway = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ bottom: number; pieces: { outline: [number, number][]; top: number }[]; top: number }> => {
  const heightCountMap = new Map<number, number>();
  const pieces: { outline: [number, number][]; top: number }[] = [];
  for (const placement of placements
    .filter(({ mesh }) => WALKWAY_MESH_REGEX.test(mesh))
    .toSorted((firstPlacement, secondPlacement) => firstPlacement.mesh.localeCompare(secondPlacement.mesh))) {
    // oxlint-disable-next-line no-await-in-loop -- one small piece is read at a time
    const { faces, vertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
    const world = toWorldVertices(vertices, placement);
    for (const [, y] of world) heightCountMap.set(roundFitted(y), (heightCountMap.get(roundFitted(y)) ?? 0) + 1);
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
        width: Math.ceil((Math.max(...xs) - corner[0]) / TOP_CELL_SIZE),
      },
    );
    const topCountMap = new Map<number, number>();
    for (const value of heights)
      if (Number.isFinite(value)) topCountMap.set(roundFitted(value), (topCountMap.get(roundFitted(value)) ?? 0) + 1);
    const [[top] = [0]] = [...topCountMap].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount);
    pieces.push({ outline, top });
  }
  // The two most common heights, the surface above the underside
  const [first = 0, second = 0] = [...heightCountMap.entries()]
    .toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .map(([y]) => y);
  return { bottom: Math.min(first, second), pieces, top: Math.max(first, second) };
};
