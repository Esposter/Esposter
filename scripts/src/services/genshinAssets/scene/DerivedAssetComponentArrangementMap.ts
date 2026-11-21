import type { ArrangementFamily } from "#src/models/genshinAssets/scene/ArrangementFamily";
import type { ArrangementRatio } from "#src/models/genshinAssets/scene/ArrangementRatio";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { TowerPlacement } from "#src/models/genshinAssets/shared/TowerPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { composeLatheAxisPoint } from "#src/services/genshinAssets/fit/composeLatheAxisPoint";
import { readTowerProfiles } from "#src/services/genshinAssets/fit/readTowerProfiles";
import { computeOutlineCrossings } from "#src/services/genshinAssets/scene/computeOutlineCrossings";
import { readObjectPositions } from "#src/services/genshinAssets/scene/readObjectPositions";
import { readTowersRow } from "#src/services/genshinAssets/scene/readTowersRow";
import { readWalkwayLift } from "#src/services/genshinAssets/scene/readWalkwayLift";
import { WindrisePlantArrangementFamilies } from "#src/services/genshinAssets/scene/WindrisePlantArrangementFamilies";
import { LOGIN_DOOR_MESH } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { Quaternion, Vector3 } from "three";

interface ComponentArrangement {
  explainedOffsets: Record<
    string,
    (placements: readonly AssetPlacement[], clips: readonly DecodedClip[]) => [number, number]
  >;
  families: ArrangementFamily[];
  ratios: Record<string, ArrangementRatio>;
}

// The arrangement of a component with no parts laid out in a witness, one object every such component refers to
const EMPTY_ARRANGEMENT: ComponentArrangement = { explainedOffsets: {}, families: [], ratios: {} };

// Each component's arrangement: the ratios its references show between parts that meet, its fitted families, each
// Beside the exports' objects it stands for, composed as the family stands its parts, and how far across and up the
// Game's own data stands each family of the witness off its laid-out place at run time, a family not named standing
// At its place
export const DerivedAssetComponentArrangementMap: Record<DerivedAssetComponent, ComponentArrangement> = {
  // The animals and the fishing scene have no parts laid out in a witness, so neither has an arrangement of its own
  [DerivedAssetComponent.Animals]: EMPTY_ARRANGEMENT,
  // Each sub-area with a catalogued extent has no arrangement of its own: its parts are its region's
  [DerivedAssetComponent.ArdraviValley]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.AshavanRealm]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.AshveilPeak]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Atocpan]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.AvidyaForest]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.BasinOfUnnumberedFlames]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.BelleauRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.BerylRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.BishuiPlain]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.BrightcrownMountains]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Character]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.ChenyuValeSouthernMountain]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.ChenyuValeUpperVale]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.CoatepecMountain]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.CourtOfFontaineRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.DesertOfHadramaveth]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Dragonspine]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.EasybreezeHolidayResort]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.ErinnyesForest]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.EverfrozenEarth]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Fishing]: EMPTY_ARRANGEMENT,
  // The Court's parts stand where the world's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Fontaine]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.FontaineResearchInstituteOfKineticEnergyEngineeringRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.GalesongHill]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.GavirehLajavard]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.HiisiIsland]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Hud]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.HypostyleDesert]: EMPTY_ARRANGEMENT,
  // Inazuma City's parts stand where the city's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Inazuma]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Kannazuka]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.LandOfLowerSetekh]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.LandOfUpperSetekh]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.LempoIsle]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.LiffeyRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Lisha]: EMPTY_ARRANGEMENT,
  // Liyue Harbor's parts stand where the city's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Liyue]: EMPTY_ARRANGEMENT,
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
          Promise.resolve(readObjectPositions(placements, ({ name }) => name === LOGIN_DOOR_MESH)),
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
  [DerivedAssetComponent.LokapalaJungle]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.LostNursery]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Minlin]: EMPTY_ARRANGEMENT,
  // Mondstadt's parts stand where the city's own data places them, as Windrise's do, so its families wait on the export
  [DerivedAssetComponent.Mondstadt]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.MorteRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.MtLaixin]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.NarukamiIsland]: EMPTY_ARRANGEMENT,
  // The People of the Springs' parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.Natlan]: EMPTY_ARRANGEMENT,
  // Nasha Town's parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.NodKrai]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.NostoiRegion]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Ochkanatlan]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.PahaIsle]: EMPTY_ARRANGEMENT,
  // Lumine is no world part, so she has no ratios or families to fit yet
  [DerivedAssetComponent.PlayerGirl]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Props]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.QiongjiEstuary]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.QuahuacanCliff]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.RealmOfFarakhkert]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.SeaOfClouds]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.SeiraiIsland]: EMPTY_ARRANGEMENT,
  // Snezhnograd's parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.Snezhnaya]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.StarfellValley]: EMPTY_ARRANGEMENT,
  // Sumeru City's parts stand where the world's own data places them, as Windrise's do
  [DerivedAssetComponent.Sumeru]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.TequemecanValley]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.TezcatepetoncoRange]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.TheChasm]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.ToyacSprings]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Traveler]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.TsurumiIsland]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Vanarana]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.VissudhaField]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.VoidseaOutlook]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.WatatsumiIsland]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.WavechaserPlain]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.Weapons]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.WindrestPeak]: EMPTY_ARRANGEMENT,
  // Windrise's parts stand where the world's own data places them, so its ratios wait on a fitted family to hold. Its plants
  // Are the families it fits, the grass and the trees, each beside the game's placements of it
  [DerivedAssetComponent.Windrise]: { explainedOffsets: {}, families: WindrisePlantArrangementFamilies, ratios: {} },
  [DerivedAssetComponent.WindwailHighland]: EMPTY_ARRANGEMENT,
  [DerivedAssetComponent.YashioriIsland]: EMPTY_ARRANGEMENT,
};
