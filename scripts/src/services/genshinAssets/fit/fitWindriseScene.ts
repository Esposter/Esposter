import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitGroundLayerField } from "#src/services/genshinAssets/fit/fitGroundLayerField";
import { fitRegionCapitals } from "#src/services/genshinAssets/fit/fitRegionCapitals";
import { fitRegionGround } from "#src/services/genshinAssets/fit/fitRegionGround";
import { fitRegionLandmarks } from "#src/services/genshinAssets/fit/fitRegionLandmarks";
import { fitSurfaceColours } from "#src/services/genshinAssets/fit/fitSurfaceColours";
import { fitWindriseOak } from "#src/services/genshinAssets/fit/fitWindriseOak";
import { fitWindrisePaving } from "#src/services/genshinAssets/fit/fitWindrisePaving";
import { fitWindrisePlants } from "#src/services/genshinAssets/fit/fitWindrisePlants";
import { fitWindriseStatue } from "#src/services/genshinAssets/fit/fitWindriseStatue";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import {
  GROUND_LAYER_CELL_SIZE,
  GROUND_RADIUS,
  WINDRISE_GROUND_LAYER_TONES,
  WINDRISE_REGION_FILE,
} from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";
import { WindrisePartFamily, WindrisePartFamilyMeshRegexMap, windriseSurfacesSchema } from "genshin-world";

// Windrise's parts fitted as our own generators' parameters, each a record under `windrise/`: its ground as hills, its
// Oak's canopy as clusters and its trunk's taper read off the export, its statue as stacks fitted piece by piece to its
// Meshes, its families' surface colours and each part's as the export's textures paint them, and its water's level over
// The oak's foot, the last three exact, and its ground's layers as a field of their shares over its base maps. Its
// Landmarks' places and turns are written into Mondstadt's region data, and every region's capital is placed with them,
// Round the same origin, since the oak's foot is the whole world's
export const fitWindriseScene = (only: readonly string[] = []): Promise<GameDataBuild> =>
  runFits(
    {
      ground: () => fitRegionGround(DerivedAssetComponent.Windrise, { x: 0, z: 0 }),
      // Mondstadt's capital is in the file Windrise's landmarks are, so the two are written one after the other
      landmarks: async () => {
        const landmarksPath = await fitRegionLandmarks(DerivedAssetComponent.Windrise, WINDRISE_REGION_FILE);
        const { notes, objects } = await fitRegionCapitals();
        return { notes: [landmarksPath, ...notes], objects };
      },
      oak: fitWindriseOak,
      paving: async () => ({ notes: [], objects: { "windrise/paving": await fitWindrisePaving() } }),
      plants: async () => ({ notes: [], objects: { "windrise/plants": await fitWindrisePlants() } }),
      statue: fitWindriseStatue,
      // The surfaces record holds the families its reader parses: the grass has no mesh in the exports to read
      surfaces: async () => ({
        notes: [],
        objects: {
          "windrise/ground-layers": await fitGroundLayerField(
            DerivedAssetComponent.Windrise,
            GROUND_RADIUS,
            GROUND_LAYER_CELL_SIZE,
            WINDRISE_GROUND_LAYER_TONES,
          ),
          "windrise/surfaces": await fitSurfaceColours(
            DerivedAssetComponent.Windrise,
            Object.fromEntries(
              windriseSurfacesSchema.keyof().options.map((family) => [family, WindrisePartFamilyMeshRegexMap[family]]),
            ),
            GROUND_RADIUS,
            [WindrisePartFamily.Ground],
          ),
        },
      }),
      water: async () => {
        const [[, originY], waterLevel] = await Promise.all([
          readWorldOrigin(DerivedAssetComponent.Windrise),
          readWorldWaterLevel(DerivedAssetComponent.Windrise),
        ]);
        return { notes: [], objects: { "windrise/water": { level: roundFitted(waterLevel - originY) } } };
      },
    },
    only,
  );
