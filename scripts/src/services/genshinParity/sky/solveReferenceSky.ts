import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetCloudCover } from "#src/models/genshinParity/sky/SetCloudCover";
import type { Vector } from "#src/models/shared/Vector";
import type { SkyShape } from "genshin-engine";

import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { computeSkyWeights } from "#src/services/genshinParity/sky/computeSkyWeights";
import { SKY_TERMS } from "#src/services/genshinParity/sky/constants";
import { fitSky } from "#src/services/genshinParity/sky/fitSky";
import { readCloudSky } from "#src/services/genshinParity/sky/readCloudSky";
import { toLinear } from "#src/services/shared/toLinear";
import { withFinalizerAsync } from "@esposter/shared";
import { toneMapNeutral, toSceneColor } from "genshin-engine";
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
// A pixel of raw sRGB bytes as the scene colour the tone mapping shows as it
const computeSceneColor = (buffer: Buffer, pixel: number): Vector => {
  const scene = toSceneColor(
    new Color(
      toLinear((buffer[pixel * 3] ?? 0) / 255),
      toLinear((buffer[pixel * 3 + 1] ?? 0) / 255),
      toLinear((buffer[pixel * 3 + 2] ?? 0) / 255),
    ),
  );
  return [scene.r, scene.g, scene.b];
};
// A solved scene colour as the display colour a sky state holds it as, which the scene inverts back on applying it
const toDisplayHex = ([red, green, blue]: Vector): string =>
  `#${new Color(...toneMapNeutral([red, green, blue])).getHexString()}`;
// A reference's sky solved as the game's sky shader draws it, the way `calibrate` solves the light: its pixels where
// The witness draws no part, the ray looks up and no cloud stands (`readCloudSky`, the clear sky fitted under its
// Clouds, so a sky more cloud than clear is not solved as their mean), each turned into its ray through the scene's
// Own camera and into scene colour through the tone mapping's inverse, under the sun and moon the scene draws its sky
// With; the colours by least squares at each shape, the shape refined around them by the simplex. Prints the colours
// As the display colours a sky state holds, then how far the scene's own sky, drawn with no cloud, stands off the
// Reference over the same pixels, and writes the reference, the solved sky and the scene's to check
export const solveReferenceSky = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{
  colors: Record<string, string>;
  drawn: { ours: string; reference: string; residual: number };
  imagePath: string;
  kept: number;
  residual: number;
  shape: SkyShape;
}> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { getLuminance, readClouds, skyMask, width } = await readCloudSky(page, { checkIsScored, height });
      const clouds = readClouds(await getLuminance(image));
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
      const { data } = await sharp(image)
        .resize(width, height, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const pixels: { color: Vector; direction: Vector; pixel: number }[] = [];
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
          pixels.push({ color: computeSceneColor(data, pixel), direction: direction.toArray(), pixel });
        }
      const { gradient } = await readWorldData<{ gradient: { green: number[]; red: number[] } }>(`${witness}/sky.json`);
      const solveAt = (shape: SkyShape) =>
        fitSky(
          pixels.map(({ color, direction }) => ({
            color,
            weights: computeSkyWeights(direction, sky, gradient, shape),
          })),
        );
      const { point } = await minimizeNelderMead(
        (values) => Promise.resolve(solveAt(toShape(values)).residual),
        SHAPE_KEYS.map((key) => SHAPE_START[key]),
        SHAPE_STEPS,
        SHAPE_ITERATIONS,
      );
      const shape = toShape(point);
      const { colors, kept, residual } = solveAt(shape);
      // The reference beside the solved sky over the pixels read, each a block of the sample's stride
      const modelled = Buffer.alloc(width * height * 3);
      for (const { direction, pixel } of pixels) {
        const weights = computeSkyWeights(direction, sky, gradient, shape);
        const [red, green, blue] = toneMapNeutral(
          [0, 1, 2].map((channel) =>
            weights.reduce((sum, weight, term) => sum + weight * (colors[term]?.[channel] ?? 0), 0),
          ) as Vector,
        );
        const display = new Color(red, green, blue);
        const [x, y] = [pixel % width, Math.floor(pixel / width)];
        for (let row = y; row < Math.min(y + SAMPLE_STRIDE, height); row++)
          for (let column = x; column < Math.min(x + SAMPLE_STRIDE, width); column++) {
            const target = (row * width + column) * 3;
            const { b, g, r } = display.clone().convertLinearToSRGB();
            modelled[target] = Math.round(Math.min(Math.max(r, 0), 1) * 255);
            modelled[target + 1] = Math.round(Math.min(Math.max(g, 0), 1) * 255);
            modelled[target + 2] = Math.round(Math.min(Math.max(b, 0), 1) * 255);
          }
      }
      // The scene's own sky with no cloud drawn, over the same pixels: what the scene draws where the solve reads, so
      // A sky solved well and drawn otherwise (a haze, a grade or a pass over it) shows as its own residual
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
      await page.evaluate(() => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)());
      const means: Record<"ours" | "reference", Vector> = { ours: [0, 0, 0], reference: [0, 0, 0] };
      let drawnError = 0;
      for (const { color, pixel } of pixels) {
        const ours = computeSceneColor(ourShot, pixel);
        for (const channel of [0, 1, 2] as const) {
          means.ours[channel] += ours[channel] / pixels.length;
          means.reference[channel] += color[channel] / pixels.length;
          drawnError += (ours[channel] - color[channel]) ** 2;
        }
      }
      const directory = join(PARITY_DIRECTORY, "sky");
      await mkdir(directory, { recursive: true });
      const imagePath = join(directory, `${referenceId}.png`);
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().png().toBuffer();
      const modelledImage = await sharp(modelled, { raw: { channels: 3, height, width } })
        .png()
        .toBuffer();
      const ourImage = await sharp(ourShot, { raw: { channels: 3, height, width } })
        .png()
        .toBuffer();
      await sharp({ create: { background: "#000", channels: 3, height, width: width * 3 } })
        .composite([
          { input: reference, left: 0, top: 0 },
          { input: modelledImage, left: width, top: 0 },
          { input: ourImage, left: width * 2, top: 0 },
        ])
        .png()
        .toFile(imagePath);
      return {
        colors: Object.fromEntries(SKY_TERMS.map((term, index) => [term, toDisplayHex(colors[index] ?? [0, 0, 0])])),
        drawn: {
          ours: toDisplayHex(means.ours),
          reference: toDisplayHex(means.reference),
          residual: Math.sqrt(drawnError / Math.max(pixels.length * 3, 1)),
        },
        imagePath,
        kept: kept / Math.max(pixels.length, 1),
        residual,
        shape,
      };
    },
    () => browser.close(),
  );
};
