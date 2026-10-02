import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { CloudStatistics } from "#src/models/genshinParity/CloudStatistics";

import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { measureClouds } from "#src/services/genshinParity/measureClouds";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessPartTarget } from "#src/services/genshinParity/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";
import { Matrix4, Vector3, Vector4 } from "three";

// Wide enough that a cloud's painted edge spans several pixels
const CLOUDS_WIDTH = 960;
// Each sky's own clear sky, a band of rows at a time, is the darker tail of its sky pixels there, and a cloud stands
// This many times as bright as it
const CLEAR_BAND_COUNT = 30;
const CLEAR_PERCENTILE = 0.1;
const CLOUD_RATIO = 1.15;
const BYTE = 255;
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
// A reference's clouds and ours by their statistics (`measureClouds`), over the sky above the horizon where no part
// Stands: a pixel is a cloud where it stands brighter than its own sky's clear tail in its band of rows by the cloud's
// Ratio, in the reference as in ours, so neither sky's colour, ours off the reference's, decides what is a cloud
export const readCloudStatistics = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ ours: CloudStatistics; reference: CloudStatistics }> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness, CLOUDS_WIDTH);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const { part, width } = await readWitnessPartTarget(page);
      const sky = await page.evaluate(() =>
        (Reflect.get(window, "readSceneSky") as () => { matrixWorld: number[]; projectionMatrixInverse: number[] })(),
      );
      const readLuminance = async (input: Buffer): Promise<Float32Array> => {
        const data = await sharp(input).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
        return Float32Array.from({ length: width * height }, (_, pixel) =>
          LUMINANCE.reduce(
            (sum, weight, channel) => sum + weight * toLinear((data[pixel * 3 + channel] ?? 0) / BYTE),
            0,
          ),
        );
      };
      await setPageWitnessView(page, { families: [] });
      const ourLuminance = await readLuminance(await page.screenshot());
      const referenceLuminance = await readLuminance(image);
      const projectionInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const world = new Matrix4().fromArray(sky.matrixWorld);
      const skyMask = Uint8Array.from({ length: width * height }, (_, pixel) => {
        if (part[pixel * 4] || !checkIsScored(pixel, width)) return 0;
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        const view = new Vector4(((column + 0.5) / width) * 2 - 1, 1 - ((row + 0.5) / height) * 2, 0.5, 1).applyMatrix4(
          projectionInverse,
        );
        return Number(new Vector3(view.x / view.w, view.y / view.w, view.z / view.w).transformDirection(world).y > 0);
      });
      const bandRows = Math.ceil(height / CLEAR_BAND_COUNT);
      const toClouds = (luminance: Float32Array): Uint8Array => {
        const clears = Array.from({ length: CLEAR_BAND_COUNT }, (_, band) => {
          const values: number[] = [];
          for (let pixel = band * bandRows * width; pixel < Math.min((band + 1) * bandRows, height) * width; pixel++)
            if (skyMask[pixel]) values.push(luminance[pixel] ?? 0);
          return values.toSorted((first, second) => first - second)[Math.floor(values.length * CLEAR_PERCENTILE)] ?? 0;
        });
        return Uint8Array.from(luminance, (value, pixel) =>
          Number(
            (skyMask[pixel] ?? 0) === 1 &&
              value > (clears[Math.floor(Math.floor(pixel / width) / bandRows)] ?? 0) * CLOUD_RATIO,
          ),
        );
      };
      return {
        ours: measureClouds(ourLuminance, { clouds: toClouds(ourLuminance), sky: skyMask }, width, height),
        reference: measureClouds(
          referenceLuminance,
          { clouds: toClouds(referenceLuminance), sky: skyMask },
          width,
          height,
        ),
      };
    },
    () => browser.close(),
  );
};
