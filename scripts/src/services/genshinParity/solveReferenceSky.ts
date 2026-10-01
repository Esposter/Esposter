import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { SkyShape } from "#src/services/genshinParity/fitSky";

import { PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { fitSky, readSkyWeights, SKY_TERMS } from "#src/services/genshinParity/fitSky";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessPartTarget } from "#src/services/genshinParity/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { readWorldData } from "#src/services/genshinAssets/readWorldData";
import { withFinalizerAsync } from "@esposter/shared";
import { toneMapNeutral, toSceneColor } from "genshin-engine";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { Color, Matrix4, Vector3, Vector4 } from "three";

type Vector = [number, number, number];
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
const SHAPE_STEPS = [0.3, 0.1, 0.15, 0.5, 2];
const SHAPE_ITERATIONS = 80;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
// A solved scene colour as the display colour a sky state holds it as, which the scene inverts back on applying it
const toDisplayHex = ([red, green, blue]: Vector): string =>
  `#${new Color(...toneMapNeutral([red, green, blue])).getHexString()}`;
// A reference's sky solved as the game's sky shader draws it, the way `calibrate` solves the light: its pixels where
// The witness draws no part and the ray looks up, each turned into its ray through the scene's own camera and into
// Scene colour through the tone mapping's inverse, under the sun and moon the scene draws its sky with; the colours by
// Least squares at each shape, the shape refined around them by the simplex. Prints the colours as the display colours
// A sky state holds, and writes the reference beside the solved sky over the pixels read, to check
export const solveReferenceSky = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ colors: Record<string, string>; imagePath: string; kept: number; residual: number; shape: SkyShape }> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const { part, width } = await readWitnessPartTarget(page);
      const sky = await page.evaluate(() =>
        (
          Reflect.get(window, "readSceneSky") as () => {
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
          if (part[pixel * 4]) continue;
          const view = new Vector4(((x + 0.5) / width) * 2 - 1, 1 - ((y + 0.5) / height) * 2, 0.5, 1).applyMatrix4(
            projectionInverse,
          );
          const direction = new Vector3(view.x / view.w, view.y / view.w, view.z / view.w)
            .transformDirection(world)
            .normalize();
          if (direction.y < MIN_SKY_HEIGHT) continue;
          const scene = toSceneColor(
            new Color(
              toLinear((data[pixel * 3] ?? 0) / 255),
              toLinear((data[pixel * 3 + 1] ?? 0) / 255),
              toLinear((data[pixel * 3 + 2] ?? 0) / 255),
            ),
          );
          pixels.push({ color: [scene.r, scene.g, scene.b], direction: direction.toArray(), pixel });
        }
      const { gradient } = await readWorldData<{ gradient: { green: number[]; red: number[] } }>(`${witness}/sky.json`);
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
      const solveAt = (shape: SkyShape) =>
        fitSky(
          pixels.map(({ color, direction }) => ({ color, weights: readSkyWeights(direction, sky, gradient, shape) })),
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
        const weights = readSkyWeights(direction, sky, gradient, shape);
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
      const directory = join(PARITY_DIRECTORY, "sky");
      await mkdir(directory, { recursive: true });
      const imagePath = join(directory, `${referenceId}.png`);
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().png().toBuffer();
      const modelledImage = await sharp(modelled, { raw: { channels: 3, height, width } })
        .png()
        .toBuffer();
      await sharp({ create: { background: "#000", channels: 3, height, width: width * 2 } })
        .composite([
          { input: reference, left: 0, top: 0 },
          { input: modelledImage, left: width, top: 0 },
        ])
        .png()
        .toFile(imagePath);
      return {
        colors: Object.fromEntries(SKY_TERMS.map((term, index) => [term, toDisplayHex(colors[index] ?? [0, 0, 0])])),
        imagePath,
        kept: kept / Math.max(pixels.length, 1),
        residual,
        shape,
      };
    },
    () => browser.close(),
  );
};
