import type { Page } from "playwright";

import { CLOUD_ELEVATION_BANDS } from "#src/services/genshinParity/constants";
import { blurGrey } from "#src/services/genshinParity/blurGrey";
import { fitClearSky } from "#src/services/genshinParity/fitClearSky";
import { readWitnessPartTarget } from "#src/services/genshinParity/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import sharp from "sharp";
import { Matrix4, Vector3, Vector4 } from "three";

// A cloud stands this many times as bright as its own sky's clear sky there, read over the sky blurred by this many
// Pixels, past a recording's grain: a dark sky's compression noise steps its luminance by more than the ratio a pixel
// At a time, and read unblurred it speckles a night's clear sky with cloud
const CLOUD_RATIO = 1.15;
const CLASSIFY_BLUR_SIGMA = 2;
const BYTE = 255;
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
// The sky of a witness page as the cloud tools read it: the sky above the horizon where no part stands, each pixel's
// Height over the horizon, an image's linear luminance there, and its clouds, a pixel standing brighter than its own
// Sky's clear sky by the cloud's ratio, the clear sky a smooth surface fitted under its clouds (`fitClearSky`), in the
// Reference as in ours, so neither sky's colour nor its gradient toward its sun decides what is a cloud
export const readCloudSky = async (
  page: Page,
  { checkIsScored, height }: { checkIsScored: (pixel: number, width: number) => boolean; height: number },
): Promise<{
  readClouds: (luminance: Float32Array) => Uint8Array;
  readElevationCoverage: (clouds: Uint8Array) => number[];
  readLuminance: (input: Buffer) => Promise<Float32Array>;
  skyMask: Uint8Array;
  width: number;
}> => {
  await setPageWitnessView(page, {});
  const { part, width } = await readWitnessPartTarget(page);
  const sky = await page.evaluate(() =>
    (Reflect.get(window, "readSceneSky") as () => { matrixWorld: number[]; projectionMatrixInverse: number[] })(),
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
  return {
    readClouds: (luminance) => {
      const blurred = blurGrey(luminance, width, height, CLASSIFY_BLUR_SIGMA);
      const clear = fitClearSky(blurred, skyMask, width, height, CLOUD_RATIO);
      return Uint8Array.from(blurred, (value, pixel) =>
        Number(
          (skyMask[pixel] ?? 0) === 1 && Math.log(Math.max(value, Number.EPSILON)) - (clear[pixel] ?? 0) > logRatio,
        ),
      );
    },
    // The share of the sky each band of its height holds as cloud
    readElevationCoverage: (clouds) =>
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
