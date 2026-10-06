import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRegionLandmarks } from "#src/services/genshinAssets/fit/fitRegionLandmarks";
import { fitWindriseGround } from "#src/services/genshinAssets/fit/fitWindriseGround";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";

// Windrise's parts fitted as our own generators' parameters, each written as a data file of the world package's: its
// Ground as hills, its landmarks' places and turns in Mondstadt's region data, and its water's level over the oak's
// Foot, the last two exact
export const fitWindriseScene = (only: readonly string[] = []): Promise<string> =>
  runFits(
    {
      ground: async () => {
        const { ground, report } = await fitWindriseGround();
        return [...report, await writeWorldData("windrise/ground.json", ground)];
      },
      landmarks: async () => [await fitRegionLandmarks(DerivedAssetComponent.Windrise, "regions/mondstadt.json")],
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
