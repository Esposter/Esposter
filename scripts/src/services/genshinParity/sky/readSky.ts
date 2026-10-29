import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetCloudCover } from "#src/models/genshinParity/sky/SetCloudCover";
import type { SkyReading } from "#src/models/genshinParity/sky/SkyReading";
import type { Vector } from "#src/models/shared/Vector";

import { getToneSlope } from "#src/services/genshinParity/display/getToneSlope";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { SAMPLE_STRIDE } from "#src/services/genshinParity/sky/constants";
import { getPixelSceneColor } from "#src/services/genshinParity/sky/getPixelSceneColor";
import { readCloudSky } from "#src/services/genshinParity/sky/readCloudSky";
import { withFinalizerAsync } from "@esposter/shared";
import { Matrix4, Vector3, Vector4 } from "three";

// The least a ray looks up to be read as sky, clear of the cloud sea and the haze over the horizon
const MIN_SKY_HEIGHT = 0.02;

// A reference's pixels where the witness draws no part, the ray looks up and no cloud stands (`readCloudSky`, the clear
// Sky fitted under its clouds, so a sky more cloud than clear is not solved as their mean), each turned into its ray
// Through the scene's own camera and into scene colour through the tone mapping's inverse, under the sun and moon the
// Scene draws its sky with, and the scene's own sky drawn with no cloud over the same frame: what the scene draws where
// The solve reads, so a sky solved well and drawn otherwise (a haze, a grade or a pass over it) shows as its own residual
export const readSky = async (referenceId: string, witness: DerivedAssetComponent): Promise<SkyReading> => {
  const { checkIsScored, close, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { computeClouds, readLuminance, skyMask, width } = await readCloudSky(page, { checkIsScored, height });
      const clouds = computeClouds(await readLuminance(image));
      const sky = await page.evaluate(() =>
        (
          Reflect.get(window, "getSceneSky") as () => {
            matrixWorld: number[];
            moonDirection: Vector;
            projectionMatrixInverse: number[];
            sunDirection: Vector;
          }
        )(),
      );
      const projectionInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const world = new Matrix4().fromArray(sky.matrixWorld);
      const data = await readRawRgb(image, width, height);
      const pixels: SkyReading["pixels"] = [];
      for (let y = 0; y < height; y += SAMPLE_STRIDE)
        for (let x = 0; x < width; x += SAMPLE_STRIDE) {
          const pixel = y * width + x;
          if (!skyMask[pixel] || clouds[pixel]) continue;
          const view = new Vector4(((x + 0.5) / width) * 2 - 1, 1 - ((y + 0.5) / height) * 2, 0.5, 1).applyMatrix4(
            projectionInverse,
          );
          const direction = new Vector3(view.x / view.w, view.y / view.w, view.z / view.w)
            .transformDirection(world)
            .normalize();
          if (direction.y < MIN_SKY_HEIGHT) continue;
          const color = getPixelSceneColor(data, pixel);
          pixels.push({ color, direction: direction.toArray(), pixel, slope: getToneSlope(color) });
        }
      const bands = await page.evaluate(() => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)());
      await page.evaluate(
        (covers) => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)(covers),
        Object.fromEntries(bands.map((band) => [band, 0])),
      );
      await setPageWitnessView(page, { families: [] });
      const ourShot = await readRawRgb(await page.screenshot(), width, height);
      return {
        data,
        height,
        image,
        ourShot,
        pixels,
        referenceId,
        sky: { moonDirection: sky.moonDirection, sunDirection: sky.sunDirection },
        width,
      };
    },
    () => close(),
  );
};
