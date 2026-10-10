import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRegionCapitals } from "#src/services/genshinAssets/fit/fitRegionCapitals";
import { fitRegionGround } from "#src/services/genshinAssets/fit/fitRegionGround";
import { fitRegionLandmarks } from "#src/services/genshinAssets/fit/fitRegionLandmarks";
import { fitSurfaceColours } from "#src/services/genshinAssets/fit/fitSurfaceColours";
import { fitWindriseOak } from "#src/services/genshinAssets/fit/fitWindriseOak";
import { fitWindrisePaving } from "#src/services/genshinAssets/fit/fitWindrisePaving";
import { fitWindriseStatue } from "#src/services/genshinAssets/fit/fitWindriseStatue";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { GROUND_RADIUS, WINDRISE_REGION_FILE } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";
import { WindrisePartFamily, WindrisePartFamilyMeshRegexMap } from "genshin-world";

// Windrise's parts fitted as our own generators' parameters, each written as a data file of the world package's: its
// Ground as hills, its landmarks' places and turns in Mondstadt's region data, its oak's canopy as clusters and its
// Trunk's taper read off the export, its statue as one radial profile per mesh, its families' surface colours and each
// Part's as the export's textures paint them, and its water's level over the oak's foot, the last three exact. Every region's capital is placed
// With the landmarks, round the same origin, since the oak's foot is the whole world's. The statue's angle count is its
// Own option, the rest ignore it
export const fitWindriseScene = (only: readonly string[] = [], angleCount?: number): Promise<string> =>
  runFits(
    {
      ground: () => fitRegionGround(DerivedAssetComponent.Windrise, { x: 0, z: 0 }),
      // Mondstadt's capital is in the file Windrise's landmarks are, so the two are written one after the other
      landmarks: async () => [
        await fitRegionLandmarks(DerivedAssetComponent.Windrise, WINDRISE_REGION_FILE),
        ...(await fitRegionCapitals()),
      ],
      oak: fitWindriseOak,
      paving: async () => [await writeWorldData("windrise/paving.json", await fitWindrisePaving())],
      statue: () => fitWindriseStatue(angleCount),
      surfaces: async () => [
        await writeWorldData(
          "windrise/surfaces.json",
          await fitSurfaceColours(DerivedAssetComponent.Windrise, WindrisePartFamilyMeshRegexMap, GROUND_RADIUS, [
            WindrisePartFamily.Ground,
          ]),
        ),
      ],
      water: async () => {
        const [[, originY], waterLevel] = await Promise.all([
          readWorldOrigin(DerivedAssetComponent.Windrise),
          readWorldWaterLevel(DerivedAssetComponent.Windrise),
        ]);
        return [await writeWorldData("windrise/water.json", { level: roundFitted(waterLevel - originY) })];
      },
    },
    only,
  );
