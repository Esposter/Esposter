import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetCloudCover } from "#src/models/genshinParity/sky/SetCloudCover";
import type { Vector } from "#src/models/shared/Vector";
import type { SkyShape } from "genshin-engine";

import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { getToneSlope } from "#src/services/genshinParity/display/getToneSlope";
import { CHANNELS, PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { writeSideBySide } from "#src/services/genshinParity/shared/writeSideBySide";
import { computeSkyWeights } from "#src/services/genshinParity/sky/computeSkyWeights";
import { SKY_TERMS } from "#src/services/genshinParity/sky/constants";
import { fitSky } from "#src/services/genshinParity/sky/fitSky";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { getPixelSceneColor } from "#src/services/genshinParity/sky/getPixelSceneColor";
import { readCloudSky } from "#src/services/genshinParity/sky/readCloudSky";
import { toDisplayHex } from "#src/services/genshinParity/sky/toDisplayHex";
import { withFinalizerAsync } from "@esposter/shared";
import { toneMapGenshin } from "genshin-engine";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { Color, Matrix4, Vector3, Vector4 } from "three";

// Every this many pixels across and down is a sample: the sky changes slowly, and a solve reads it many times
const SAMPLE_STRIDE = 4;
// The least a ray looks up to be read as sky, clear of the cloud sea and the haze over the horizon
const MIN_SKY_HEIGHT = 0.02;
const SHAPE_START: SkyShape = { frontBackBlend: 1, haloHeight: 0.3, horizonBand: 0.45, moonSize: 1, sunHaloSize: 4 };
const SHAPE_KEYS = ["frontBackBlend", "haloHeight", "horizonBand", "moonSize", "sunHaloSize"] as const;
// The least a reach or a size is held at, as the shader divides by it, and the least the sun's halo and the moon are:
// Smaller, a halo or a glow spreads over the whole sky and stands in for its colours, as clouds pull it
const LEAST_SHAPE = 1e-3;
const LEAST_SUN_HALO_SIZE = 1;
const LEAST_MOON_SIZE = 0.1;
// The blend between the colours toward the sun and away from it is a share, as the shader reads it
const toShape = ([
  frontBackBlend = 0,
  haloHeight = 0,
  horizonBand = 0,
  moonSize = 0,
  sunHaloSize = 0,
]: readonly number[]): SkyShape => ({
  frontBackBlend: Math.min(Math.max(frontBackBlend, 0), 1),
  haloHeight: Math.max(haloHeight, LEAST_SHAPE),
  horizonBand: Math.max(horizonBand, LEAST_SHAPE),
  moonSize: Math.max(moonSize, LEAST_MOON_SIZE),
  sunHaloSize: Math.max(sunHaloSize, LEAST_SUN_HALO_SIZE),
});
const SHAPE_STEPS = [0.3, 0.1, 0.15, 0.5, 2];
const SHAPE_ITERATIONS = 80;
// One reference's clear sky as the solve reads it, and the scene's own sky drawn with no cloud beside it
interface SkyReading {
  data: Buffer;
  height: number;
  image: Buffer;
  ourShot: Buffer;
  pixels: { color: Vector; direction: Vector; pixel: number; slope: Vector }[];
  referenceId: string;
  sky: { moonDirection: Vector; sunDirection: Vector };
  width: number;
}
// A reference's pixels where the witness draws no part, the ray looks up and no cloud stands (`readCloudSky`, the clear
// Sky fitted under its clouds, so a sky more cloud than clear is not solved as their mean), each turned into its ray
// Through the scene's own camera and into scene colour through the tone mapping's inverse, under the sun and moon the
// Scene draws its sky with, and the scene's own sky drawn with no cloud over the same frame: what the scene draws where
// The solve reads, so a sky solved well and drawn otherwise (a haze, a grade or a pass over it) shows as its own residual
const readSky = async (referenceId: string, witness: DerivedAssetComponent): Promise<SkyReading> => {
  const { close, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
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
      const data = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
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
      const ourShot = await sharp(await page.screenshot())
        .resize(width, height, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer();
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
// One hour's sky solved as the game's sky shader draws it, the way `calibrate` solves the light, over the clear sky of
// Every reference given at once (`readSky`): each frame shows its own patch of one sky, and solved alone the day's
// Title and its door frame read two skies far apart, each drawing the other's patch wrong. The colours by least squares
// At each shape, weighted to what the screen shows (`fitSky`), the shape refined around them by the simplex. Prints the
// Colours as the display colours a sky state holds, then for each reference how far the scene's own sky, drawn with no
// Cloud, stands off it over the pixels read as the screen shows both, and writes the reference, the solved sky and the
// Scene's to check
export const solveReferenceSky = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
): Promise<{
  colors: Record<string, string>;
  fullResidual: number;
  kept: number;
  references: {
    drawn: { modelResidual: number; ours: string; reference: string; residual: number };
    imagePath: string;
    referenceId: string;
  }[];
  residual: number;
  shape: SkyShape;
}> => {
  await fetchReferences();
  const readings: SkyReading[] = [];
  for (const referenceId of referenceIds)
    // oxlint-disable-next-line no-await-in-loop -- each page is opened and closed in turn, so no two browsers run at once
    readings.push(await readSky(referenceId, witness));
  const { gradient } = await readWorldData<{ gradient: { green: number[]; red: number[] } }>(`${witness}/sky.json`);
  const solveAt = (shape: SkyShape) =>
    fitSky(
      readings.flatMap(({ pixels, sky }) =>
        pixels.map(({ color, direction, slope }) => ({
          color,
          slope,
          weights: computeSkyWeights(direction, sky, gradient, shape),
        })),
      ),
    );
  const { point } = await minimizeNelderMead(
    (values) => Promise.resolve(solveAt(toShape(values)).residual),
    SHAPE_KEYS.map((key) => SHAPE_START[key]),
    SHAPE_STEPS,
    SHAPE_ITERATIONS,
  );
  const shape = toShape(point);
  const { colors, fullResidual, kept, residual } = solveAt(shape);
  const directory = join(PARITY_DIRECTORY, "sky");
  await mkdir(directory, { recursive: true });
  const references = await Promise.all(
    readings.map(async ({ data, height, image, ourShot, pixels, referenceId, sky, width }) => {
      // The reference beside the solved sky over the pixels read, each a block of the sample's stride, as the screen
      // Shows it
      const modelled = Buffer.alloc(width * height * 3);
      const means: Record<"ours" | "reference", Vector> = { ours: [0, 0, 0], reference: [0, 0, 0] };
      let drawnError = 0;
      // How far the scene draws its sky from the solved model at the same colours, which reads naught when the scene
      // Draws the shader the solve models and the colours it holds are the ones just solved
      let modelError = 0;
      for (const { direction, pixel } of pixels) {
        const weights = computeSkyWeights(direction, sky, gradient, shape);
        const modelColor = CHANNELS.map((channel) =>
          weights.reduce((sum, weight, term) => sum + weight * (colors[term]?.[channel] ?? 0), 0),
        ) as Vector;
        const shown = toneMapGenshin(modelColor);
        const { b, g, r } = new Color(...shown).convertLinearToSRGB();
        const [x, y] = [pixel % width, Math.floor(pixel / width)];
        for (let row = y; row < Math.min(y + SAMPLE_STRIDE, height); row++)
          for (let column = x; column < Math.min(x + SAMPLE_STRIDE, width); column++) {
            const target = (row * width + column) * 3;
            modelled[target] = Math.round(Math.min(Math.max(r, 0), 1) * 255);
            modelled[target + 1] = Math.round(Math.min(Math.max(g, 0), 1) * 255);
            modelled[target + 2] = Math.round(Math.min(Math.max(b, 0), 1) * 255);
          }
        const ours = getPixelDisplayColor(ourShot, pixel);
        const color = getPixelDisplayColor(data, pixel);
        for (const channel of CHANNELS) {
          means.ours[channel] += ours[channel] / pixels.length;
          means.reference[channel] += color[channel] / pixels.length;
          drawnError += (ours[channel] - color[channel]) ** 2;
          modelError += (ours[channel] - shown[channel]) ** 2;
        }
      }
      const imagePath = join(directory, `${referenceId}.png`);
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().png().toBuffer();
      const modelledImage = await sharp(modelled, { raw: { channels: 3, height, width } })
        .png()
        .toBuffer();
      const ourImage = await sharp(ourShot, { raw: { channels: 3, height, width } })
        .png()
        .toBuffer();
      await writeSideBySide([reference, modelledImage, ourImage], { height, width }, imagePath);
      const count = Math.max(pixels.length * CHANNELS.length, 1);
      return {
        drawn: {
          modelResidual: Math.sqrt(modelError / count),
          ours: `#${new Color(...means.ours).getHexString()}`,
          reference: `#${new Color(...means.reference).getHexString()}`,
          residual: Math.sqrt(drawnError / count),
        },
        imagePath,
        referenceId,
      };
    }),
  );
  return {
    colors: Object.fromEntries(SKY_TERMS.map((term, index) => [term, toDisplayHex(colors[index] ?? [0, 0, 0])])),
    fullResidual,
    kept:
      kept /
      Math.max(
        readings.reduce((sum, { pixels }) => sum + pixels.length, 0),
        1,
      ),
    references,
    residual,
    shape,
  };
};
