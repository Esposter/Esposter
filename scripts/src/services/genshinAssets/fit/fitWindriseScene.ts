import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRegionCapitals } from "#src/services/genshinAssets/fit/fitRegionCapitals";
import { fitRegionGround } from "#src/services/genshinAssets/fit/fitRegionGround";
import { fitRegionLandmarks } from "#src/services/genshinAssets/fit/fitRegionLandmarks";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldWaterLevel } from "#src/services/genshinAssets/world/readWorldWaterLevel";

// Windrise's parts fitted as our own generators' parameters, each written as a data file of the world package's: its
// Ground as hills, its landmarks' places and turns in Mondstadt's region data, and its water's level over the oak's
// Foot, the last two exact. Every region's capital is placed with the landmarks, round the same origin, since the oak's
// Foot is the whole world's
export const fitWindriseScene = (only: readonly string[] = []): Promise<string> =>
  runFits(
    {
      ground: () => fitRegionGround(DerivedAssetComponent.Windrise, { x: 0, z: 0 }),
      // Mondstadt's capital is in the file Windrise's landmarks are, so the two are written one after the other
      landmarks: async () => [
        await fitRegionLandmarks(DerivedAssetComponent.Windrise, "regions/mondstadt.json"),
        ...(await fitRegionCapitals()),
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
