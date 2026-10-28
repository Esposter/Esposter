import type { TowerPlacement } from "#src/models/genshinAssets/shared/TowerPlacement";
import type { ArrangementFamily } from "#src/models/genshinAssets/scene/ArrangementFamily";
import type { ArrangementRatio } from "#src/models/genshinAssets/scene/ArrangementRatio";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { Vector } from "#src/models/shared/Vector";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { composeLatheAxisPoint } from "#src/services/genshinAssets/fit/composeLatheAxisPoint";
import { readTowerProfiles } from "#src/services/genshinAssets/fit/readTowerProfiles";
import { computeOutlineCrossings } from "#src/services/genshinAssets/scene/computeOutlineCrossings";
import { readObjectPositions } from "#src/services/genshinAssets/scene/readObjectPositions";
import { readTowersRow } from "#src/services/genshinAssets/scene/readTowersRow";
import { readWalkwayLift } from "#src/services/genshinAssets/scene/readWalkwayLift";
import { WindrisePlantArrangementFamilies } from "#src/services/genshinAssets/scene/WindrisePlantArrangementFamilies";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { Quaternion, Vector3 } from "three";

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
  [DerivedAssetComponent.Character]: { explainedOffsets: {}, families: [], ratios: {} },
  // The Court's parts stand where the world's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Fontaine]: { explainedOffsets: {}, families: [], ratios: {} },
  [DerivedAssetComponent.Hud]: { explainedOffsets: {}, families: [], ratios: {} },
  // Inazuma City's parts stand where the city's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Inazuma]: { explainedOffsets: {}, families: [], ratios: {} },
  // Liyue Harbor's parts stand where the city's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Liyue]: { explainedOffsets: {}, families: [], ratios: {} },
  [DerivedAssetComponent.Login]: {
    // The towers' row and its bridges keep their laid places while every block of the walkway rises under the camera,
    // So the scene, which stands the walkway risen, stands them the lift lower
    explainedOffsets: {
      Bridges: (placements, clips) => [0, -readWalkwayLift(placements, clips)],
      Towers: (placements, clips) => [0, -readWalkwayLift(placements, clips)],
    },
    families: [
      {
        name: "Towers",
        // Each by both ends of its lathe's axis, its foot and its crown, so a scale off stands its crown off
        readExpected: async (placements, meshDirectory) =>
          (await readTowerProfiles(placements, meshDirectory)).flatMap(({ placement, profile }) => [
            composeLatheAxisPoint(profile, placement, 0),
            composeLatheAxisPoint(
              profile,
              placement,
              profile.sections.reduce((sum, { height }) => sum + height, 0),
            ),
          ]),
        readPositions: async () => {
          const { facades, placements } = await readWorldData<{
            facades: Record<string, { sections: { height: number }[] }>;
            placements: TowerPlacement[];
          }>("login/towers.json");
          return placements.flatMap(({ position, rotation, scale, tower }) => {
            const height = (facades[tower]?.sections ?? []).reduce((sum, section) => sum + section.height, 0);
            const [x = 0, y = 0, z = 0, w = 1] = rotation;
            return [
              position,
              new Vector3(0, height * scale, 0)
                .applyQuaternion(new Quaternion(x, y, z, w))
                .add(new Vector3(...position))
                .toArray(),
            ];
          });
        },
        readRow: readTowersRow,
      },
      {
        name: "Bridges",
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
        readRow: readTowersRow,
      },
      {
        name: "Door",
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
  // Mondstadt's parts stand where the city's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Mondstadt]: { explainedOffsets: {}, families: [], ratios: {} },
  // The People of the Springs' parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.Natlan]: { explainedOffsets: {}, families: [], ratios: {} },
  // Nasha Town's parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.NodKrai]: { explainedOffsets: {}, families: [], ratios: {} },
  // Lumine is no world part, so she has no ratios or families to fit yet
  [DerivedAssetComponent.PlayerGirl]: { explainedOffsets: {}, families: [], ratios: {} },
  // Snezhnograd's parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.Snezhnaya]: { explainedOffsets: {}, families: [], ratios: {} },
  // Sumeru City's parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.Sumeru]: { explainedOffsets: {}, families: [], ratios: {} },
  [DerivedAssetComponent.Traveler]: { explainedOffsets: {}, families: [], ratios: {} },
  // Windrise's parts stand where the world's own data places them, so its ratios wait on a fitted family to hold. Its plants
  // Are the families it fits, the grass and the trees, each beside the game's placements of it
  [DerivedAssetComponent.Windrise]: { explainedOffsets: {}, families: WindrisePlantArrangementFamilies, ratios: {} },
};
