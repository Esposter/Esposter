import type { ArrangementFamily } from "#src/models/genshinAssets/scene/ArrangementFamily";
import type { ArrangementRatio } from "#src/models/genshinAssets/scene/ArrangementRatio";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { Vector } from "#src/models/shared/Vector";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitLoginTowers } from "#src/services/genshinAssets/fit/fitLoginTowers";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";

// Where an outline's edges cross a depth, the x of each edge that spans it
const computeOutlineCrossings = (outline: readonly [number, number][], depth: number): number[] =>
  outline.flatMap(([x, z], index) => {
    const [nextX = x, nextZ = z] = outline[(index + 1) % outline.length] ?? [];
    if ((z - depth) * (nextZ - depth) > 0 || z === nextZ) return [];
    else return [x + ((depth - z) / (nextZ - z)) * (nextX - x)];
  });
// Where the exports' objects a family stands for stand, in three's axes: a part placed at its object's own place, as a
// Hull and the door are
const readObjectPositions = (
  placements: readonly AssetPlacement[],
  checkIsStoodFor: (placement: AssetPlacement) => boolean,
): Vector[] =>
  placements.filter((placement) => checkIsStoodFor(placement)).map(({ position }) => toRightHanded(position));
// How far the walkway's blocks rise into place: Ani_Login_Lift's settled height on each block's own animator, a block
// Standing at unit scale in its row, so at the row's scale in the world
const readWalkwayLift = (placements: readonly AssetPlacement[], clips: readonly DecodedClip[]): number => {
  const height = clips
    .find(({ name }) => name === "Ani_Login_Lift")
    ?.curves.find(({ component, property }) => property === "position" && component === "y")
    ?.samples.at(-1);
  const block = placements.find(({ name }) => /^LoginScene_Bridge01_\d+_Vo$/u.test(name));
  return (height ?? 0) * (block?.scale[1] ?? 0);
};
// Each component's arrangement: the ratios its references show between parts that meet, its fitted families, each
// Beside the exports' objects it stands for, composed as the family stands its parts, and how far across and up the
// Game's own data stands each family of the witness off its laid-out place at run time, a family not named standing
// At its place
export const DerivedAssetArrangementMap: Record<
  DerivedAssetComponent,
  {
    explainedOffsets: Record<
      string,
      (placements: readonly AssetPlacement[], clips: readonly DecodedClip[]) => [number, number]
    >;
    families: ArrangementFamily[];
    ratios: Record<string, ArrangementRatio>;
  }
> = {
  [DerivedAssetComponent.Login]: {
    // The towers' row and its bridges keep their laid places while every block of the walkway rises under the camera,
    // So the scene, which stands the walkway risen, stands them the lift lower
    explainedOffsets: {
      Bridges: (placements, clips) => [0, -readWalkwayLift(placements, clips)],
      Towers: (placements, clips) => [0, -readWalkwayLift(placements, clips)],
    },
    families: [
      {
        name: "towers",
        // Each at the foot of its lathe's axis, as the towers' fit stands them from the exports
        readExpected: async (placements, meshDirectory) =>
          (await fitLoginTowers(placements, meshDirectory)).placements.map(({ position }) => position),
        readPositions: async () =>
          (await readWorldData<{ placements: { position: Vector }[] }>("login/towers.json")).placements.map(
            ({ position }) => position,
          ),
      },
      {
        name: "bridges",
        readExpected: (placements) =>
          Promise.resolve(
            readObjectPositions(placements, ({ mesh }) =>
              /^LoginScene_(?:Bridge0[234]|Pillar03)(?:_\d+)?_Lod\d$/u.test(mesh),
            ),
          ),
        readPositions: async () =>
          (await readWorldData<{ placements: { position: Vector }[] }>("login/hulls.json")).placements.map(
            ({ position }) => position,
          ),
      },
      {
        name: "door",
        // Its skin, which names no mesh of its own
        readExpected: (placements) =>
          Promise.resolve(readObjectPositions(placements, ({ name }) => name === "LoginScene_Door01_Vo")),
        readPositions: async () => [(await readWorldData<{ position: Vector }>("login/door.json")).position],
      },
    ],
    ratios: {
      // The door's dais and the walkway's top along the row of the door's foot, left to right: the dais at 852 and
      // 1069, the walkway at 861 and 1058 (Login/Scene/Index.reference.ts, source `doorRecording`)
      doorOverWalkway: {
        ends: [852, 861, 1058, 1069],
        readEnds: async () => {
          const [{ position, size }, { pieces }] = await Promise.all([
            readWorldData<{ position: Vector; size: Vector }>("login/door.json"),
            readWorldData<{ pieces: { outline: [number, number][] }[] }>("login/walkway.json"),
          ]);
          const [doorX, , doorZ] = position;
          // The walkway's sides under the dais, the outermost of its pieces' straight across its depth
          const sides = pieces.flatMap(({ outline }) => computeOutlineCrossings(outline, doorZ));
          return [doorX - size[0] / 2, Math.min(...sides), Math.max(...sides), doorX + size[0] / 2];
        },
        reference: "login-door-recording, the row of the door's foot",
      },
    },
  },
  // Windrise's parts stand where the world's own data places them, so its ratios wait on a fitted family to hold
  [DerivedAssetComponent.Windrise]: { explainedOffsets: {}, families: [], ratios: {} },
};
