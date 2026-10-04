import type { Page } from "playwright";

import { computeOtsuThreshold } from "#src/services/genshinAssets/shared/computeOtsuThreshold";
import { blurGrey } from "#src/services/genshinParity/shared/blurGrey";
import { CLOUD_ELEVATION_BANDS, LUMINANCE } from "#src/services/genshinParity/shared/constants";
import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { fitClearSky } from "#src/services/genshinParity/sky/fitClearSky";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import sharp from "sharp";
import { Matrix4, Vector3, Vector4 } from "three";

// A cloud stands at least this many times as bright as its own sky's clear sky there, read over the sky blurred by
// This many pixels, past a recording's grain: a dark sky's compression noise steps its luminance by more than the ratio
// A pixel at a time, and read unblurred it speckles a night's clear sky with cloud
const CLOUD_RATIO = 1.15;
const CLASSIFY_BLUR_SIGMA = 2;
// The sky of a witness page as the cloud tools read it: the sky above the horizon where no part stands, each pixel's
// Height over the horizon, an image's linear luminance there, and its clouds, a pixel standing brighter than its own
// Sky's clear sky by Otsu's split of the sky or the cloud's ratio, whichever is more, the clear sky a smooth surface
// Fitted under its clouds (`fitClearSky`), in the reference as in ours, so neither sky's colour nor its gradient
// Toward its sun decides what is a cloud
export const readCloudSky = async (
  page: Page,
  { checkIsScored, height }: { checkIsScored: (pixel: number, width: number) => boolean; height: number },
): Promise<{
  computeClouds: (luminance: Float32Array, threshold?: number) => Uint8Array;
  computeCloudThreshold: (luminance: Float32Array) => number;
  computeElevationCoverage: (clouds: Uint8Array) => number[];
  readLuminance: (input: Buffer) => Promise<Float32Array>;
  skyMask: Uint8Array;
  width: number;
}> => {
  await setPageWitnessView(page, {});
  const { part, width } = await readWitnessPartTarget(page);
  const sky = await page.evaluate(() =>
    (Reflect.get(window, "getSceneSky") as () => { matrixWorld: number[]; projectionMatrixInverse: number[] })(),
  );
  const projectionInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
  const world = new Matrix4().fromArray(sky.matrixWorld);
  // Each pixel's height over the horizon in degrees
  const elevations = Float32Array.from({ length: width * height }, (_, pixel) => {
    const [column, row] = [pixel % width, Math.floor(pixel / width)];
    const view = new Vector4(((column + 0.5) / width) * 2 - 1, 1 - ((row + 0.5) / height) * 2, 0.5, 1).applyMatrix4(
      projectionInverse,
    );
    const direction = new Vector3(view.x / view.w, view.y / view.w, view.z / view.w).transformDirection(world);
    return (Math.asin(Math.min(Math.max(direction.y, -1), 1)) * 180) / Math.PI;
  });
  const skyMask = Uint8Array.from({ length: width * height }, (_, pixel) =>
    Number(!part[pixel * 4] && checkIsScored(pixel, width) && (elevations[pixel] ?? 0) > 0),
  );
  const logRatio = Math.log(CLOUD_RATIO);
  // How far each pixel of the sky stands over its own clear sky, as the logarithm of their ratio
  const computeOvers = (luminance: Float32Array): Float32Array => {
    const blurred = blurGrey(luminance, width, height, CLASSIFY_BLUR_SIGMA);
    const clear = fitClearSky(blurred, skyMask, width, height, CLOUD_RATIO);
    return Float32Array.from(blurred, (value, pixel) =>
      skyMask[pixel] ? Math.max(Math.log(Math.max(value, Number.EPSILON)) - (clear[pixel] ?? 0), 0) : 0,
    );
  };
  // The clear surface settles under a sky's own wisps and its glow toward the sun, which then stand past the ratio
  // Over it, so the split is Otsu's between the sky's two populations wherever that lies past the ratio
  const computeThreshold = (overs: Float32Array): number => {
    const greatest = overs.reduce((most, over) => Math.max(most, over), Number.EPSILON);
    const skyOvers = Array.from(
      overs.filter((_, pixel) => skyMask[pixel]),
      (over) => (over / greatest) * BYTE,
    );
    return Math.max(logRatio, (computeOtsuThreshold(skyOvers) / BYTE) * greatest);
  };
  return {
    // A sky's clouds by its own split, or by a split held from another sky: ours read at the reference's, so a guess
    // That moves our clouds does not move what counts as one
    computeClouds: (luminance, threshold) => {
      const overs = computeOvers(luminance);
      const split = threshold ?? computeThreshold(overs);
      return Uint8Array.from(overs, (over, pixel) => Number((skyMask[pixel] ?? 0) === 1 && over > split));
    },
    computeCloudThreshold: (luminance) => computeThreshold(computeOvers(luminance)),
    // The share of the sky each band of its height holds as cloud
    computeElevationCoverage: (clouds) =>
      CLOUD_ELEVATION_BANDS.slice(1).map((top, band) => {
        const bottom = CLOUD_ELEVATION_BANDS[band] ?? 0;
        let skyCount = 0;
        let cloudCount = 0;
        for (const [pixel, elevation] of elevations.entries())
          if (skyMask[pixel] && elevation >= bottom && elevation < top) {
            skyCount++;
            cloudCount += clouds[pixel] ?? 0;
          }
        return cloudCount / Math.max(skyCount, 1);
      }),
    readLuminance: async (input) => {
      const data = await sharp(input).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      return Float32Array.from({ length: width * height }, (_, pixel) =>
        LUMINANCE.reduce((sum, weight, channel) => sum + weight * toLinear((data[pixel * 3 + channel] ?? 0) / BYTE), 0),
      );
    },
    skyMask,
    width,
  };
};
