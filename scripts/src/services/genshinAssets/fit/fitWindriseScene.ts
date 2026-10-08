import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRegionCapitals } from "#src/services/genshinAssets/fit/fitRegionCapitals";
import { fitRegionGround } from "#src/services/genshinAssets/fit/fitRegionGround";
import { fitRegionLandmarks } from "#src/services/genshinAssets/fit/fitRegionLandmarks";
import { fitWindriseOak } from "#src/services/genshinAssets/fit/fitWindriseOak";
import { fitWindrisePaving } from "#src/services/genshinAssets/fit/fitWindrisePaving";
import { fitWindriseStatue } from "#src/services/genshinAssets/fit/fitWindriseStatue";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";

// Windrise's parts fitted as our own generators' parameters, each written as a data file of the world package's: its
// Ground as hills, its landmarks' places and turns in Mondstadt's region data, its oak's canopy as clusters and its
// Trunk's taper read off the export, its statue as two lathes and its water's level over the oak's foot, the last three
// Exact. Every region's capital is placed with the landmarks, round the same origin, since the oak's foot is the whole world's
export const fitWindriseScene = (only: readonly string[] = []): Promise<string> =>
  runFits(
    {
      ground: () => fitRegionGround(DerivedAssetComponent.Windrise, { x: 0, z: 0 }),
      // Mondstadt's capital is in the file Windrise's landmarks are, so the two are written one after the other
      landmarks: async () => [
        await fitRegionLandmarks(DerivedAssetComponent.Windrise, "regions/mondstadt.json"),
        ...(await fitRegionCapitals()),
      ],
      paving: async () => [await writeWorldData("windrise/paving.json", await fitWindrisePaving())],
      oak: fitWindriseOak,
      statue: fitWindriseStatue,
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
