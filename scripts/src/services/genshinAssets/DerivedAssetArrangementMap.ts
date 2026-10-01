import type { ArrangementFamily } from "#src/models/genshinAssets/ArrangementFamily";
import type { ArrangementRatio } from "#src/models/genshinAssets/ArrangementRatio";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { readWorldData } from "#src/services/genshinAssets/readWorldData";

type Point = [number, number, number];
// Where an outline's edges cross a depth, the x of each edge that spans it
const readOutlineCrossings = (outline: readonly [number, number][], depth: number): number[] =>
  outline.flatMap(([x, z], index) => {
    const [nextX = x, nextZ = z] = outline[(index + 1) % outline.length] ?? [];
    if ((z - depth) * (nextZ - depth) > 0 || z === nextZ) return [];
    return [x + ((depth - z) / (nextZ - z)) * (nextX - x)];
  });
// Each component's arrangement: the ratios its references show between parts that meet, and its fitted families, each
// Named by the exports' objects it stands for
export const DerivedAssetArrangementMap: Record<
  DerivedAssetComponent,
  { families: ArrangementFamily[]; ratios: Record<string, ArrangementRatio> }
> = {
  [DerivedAssetComponent.Login]: {
    families: [
      {
        name: "towers",
        nameRegex: /^LoginScene_Build\d+_\d+_Lod\d$/u,
        readPositions: async () =>
          (await readWorldData<{ placements: { position: Point }[] }>("login/towers.json")).placements.map(
            ({ position }) => position,
          ),
      },
      {
        name: "bridges",
        nameRegex: /^LoginScene_(?:Bridge0[234]|Pillar03)(?:_\d+)?_Lod\d$/u,
        readPositions: async () =>
          (await readWorldData<{ placements: { position: Point }[] }>("login/silhouettes.json")).placements.map(
            ({ position }) => position,
          ),
      },
      {
        name: "door",
        nameRegex: /^LoginScene_Door01_Vo$/u,
        readPositions: async () => [(await readWorldData<{ position: Point }>("login/door.json")).position],
      },
    ],
    ratios: {
      // The door's dais and the walkway's top along the row of the door's foot, left to right: the dais at 852 and
      // 1069, the walkway at 861 and 1058 (Login/Scene/Index.reference.ts, source `doorRecording`)
      doorOverWalkway: {
        ends: [852, 861, 1058, 1069],
        readEnds: async () => {
          const [{ position, size }, { pieces }] = await Promise.all([
            readWorldData<{ position: Point; size: Point }>("login/door.json"),
            readWorldData<{ pieces: { outline: [number, number][] }[] }>("login/walkway.json"),
          ]);
          const [doorX, , doorZ] = position;
          // The walkway's sides under the dais, the outermost of its pieces' straight across its depth
          const sides = pieces.flatMap(({ outline }) => readOutlineCrossings(outline, doorZ));
          return [doorX - size[0] / 2, Math.min(...sides), Math.max(...sides), doorX + size[0] / 2];
        },
        reference: "login-door-recording, the row of the door's foot",
      },
    },
  },
};
