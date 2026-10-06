import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitWindriseGround } from "#src/services/genshinAssets/fit/fitWindriseGround";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";

// Windrise's parts fitted as our own generators' parameters, each written as a data file of the world package's: its
// Ground as hills, and its water's level over the oak's foot, exact
export const fitWindriseScene = (only: readonly string[] = []): Promise<string> =>
  runFits(
    {
      ground: async () => {
        const { ground, report } = await fitWindriseGround();
        return [...report, await writeWorldData("windrise/ground.json", ground)];
      },
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
