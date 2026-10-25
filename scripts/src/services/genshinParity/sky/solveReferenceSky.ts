import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SkyReading } from "#src/models/genshinParity/sky/SkyReading";
import type { Vector } from "#src/models/shared/Vector";
import type { SkyShape } from "genshin-engine";

import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { CHANNELS, PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { writeSideBySide } from "#src/services/genshinParity/shared/writeSideBySide";
import { computeSkyWeights } from "#src/services/genshinParity/sky/computeSkyWeights";
import { SAMPLE_STRIDE, SKY_TERMS } from "#src/services/genshinParity/sky/constants";
import { fitSky } from "#src/services/genshinParity/sky/fitSky";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { readSky } from "#src/services/genshinParity/sky/readSky";
import { toDisplayHex } from "#src/services/genshinParity/sky/toDisplayHex";
import { toShape } from "#src/services/genshinParity/sky/toShape";
import { minimizeNelderMead } from "#src/services/recreation/solve/minimizeNelderMead";
import { toneMapGenshin } from "genshin-engine";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { Color } from "three";

const SHAPE_START: SkyShape = { frontBackBlend: 1, haloHeight: 0.3, horizonBand: 0.45, moonSize: 1, sunHaloSize: 4 };
const SHAPE_KEYS = ["frontBackBlend", "haloHeight", "horizonBand", "moonSize", "sunHaloSize"] as const;
const SHAPE_STEPS = [0.3, 0.1, 0.15, 0.5, 2];
const SHAPE_ITERATIONS = 80;

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
