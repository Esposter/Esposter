import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { LightCeilings } from "#src/models/genshinParity/witness/LightCeilings";
import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { applyPartGains } from "#src/services/genshinParity/witness/applyPartGains";
import { blurPartField } from "#src/services/genshinParity/witness/blurPartField";
import { computeHeightBands } from "#src/services/genshinParity/witness/computeHeightBands";
import { computeRatioMap } from "#src/services/genshinParity/witness/computeRatioMap";
import { HEIGHT_EDGES, MIN_DENOMINATOR, TABLE_DEPTH_EDGES } from "#src/services/genshinParity/witness/constants";
import { correctByBins } from "#src/services/genshinParity/witness/correctByBins";
import { countPassed } from "#src/services/genshinParity/witness/countPassed";
import { createLightScorer } from "#src/services/genshinParity/witness/createLightScorer";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { ID_SEPARATOR } from "@esposter/shared";

// The edges each binning splits by: depth in metres, the cosine to the light and how far a face turns up, each pixel's
// Band the count of edges it passes
const DEPTH_EDGES = [10, 20, 35, 50, 80, 120, 200];
const FACING_EDGES = [-0.6, -0.3, 0, 0.3, 0.6];
const UPWARD_EDGES = [-0.3, 0.3];
// How far the smooth field reaches either side of a pixel, in the structure's pixels
const FIELD_RADIUS = 4;

// What any light could still recover of a reference's frame: the exports' frame corrected, channel by channel in linear
// Colour, to the reference's own mean over every part pixel of a bin, and scored again. A light, a haze or a grade
// That depends only on what a bin holds can recover no more than its row, so a row that recovers little says the light
// Is spent at that grain and the rest of the parts' error varies inside the bins. Each row is the frame's FLIP so
// Corrected, beside the exports' frame as drawn. Beside them, each height band's mean linear luminance in the reference
// And the exports by depth, and a map of the smooth field's ratio over the frame, red where the exports stand brighter
// Than the reference and blue where darker, so a cell of the table is found on the frame
export const readLightCeilings = async ({
  checkIsScored,
  direction,
  exportsShot,
  gbuffer: { depth, height, normal, part, width },
  heights,
  image,
}: {
  checkIsScored: (pixel: number, width: number) => boolean;
  direction: Readonly<Vector>;
  exportsShot: Buffer;
  gbuffer: Pick<WitnessGbuffer, "depth" | "height" | "normal" | "part" | "width">;
  heights: Float32Array;
  image: Buffer;
}): Promise<LightCeilings> => {
  const count = width * height;
  const readLinear = async (input: Buffer): Promise<Float32Array> => {
    const data = await readRawRgb(input, width, height);
    return Float32Array.from(data, (value) => toLinear(value / BYTE));
  };
  const [reference, exports] = await Promise.all([readLinear(image), readLinear(exportsShot)]);
  const checkIsPart = (pixel: number): boolean => Boolean(part[pixel * 4]) && checkIsScored(pixel, width);
  const score = await createLightScorer({ checkIsScored, height, image, width });
  const correctBy = (getBin: (pixel: number) => string): Float32Array =>
    correctByBins({ checkIsPart, count, exports, getBin, reference });
  const blur = (source: Float32Array): Float32Array =>
    blurPartField(source, { checkIsPart, height, radius: FIELD_RADIUS, width });
  const getFacing = (pixel: number): number =>
    countPassed(
      FACING_EDGES,
      (normal[pixel * 4] ?? 0) * direction[0] +
        (normal[pixel * 4 + 1] ?? 0) * direction[1] +
        (normal[pixel * 4 + 2] ?? 0) * direction[2],
    );
  const getShading = (pixel: number): string =>
    `${part[pixel * 4 + 1]}${ID_SEPARATOR}${countPassed(DEPTH_EDGES, depth[pixel * 4] ?? 0)}${ID_SEPARATOR}${getFacing(pixel)}${ID_SEPARATOR}${countPassed(UPWARD_EDGES, normal[pixel * 4 + 1] ?? 0)}`;
  const [blurredReference, blurredExports] = [blur(reference), blur(exports)];
  const corrections: [string, Float32Array][] = [
    ["by depth, facing and how far a face turns up", correctBy(getShading)],
    [
      "by depth, facing, how far a face turns up and height",
      correctBy((pixel) => `${getShading(pixel)}${ID_SEPARATOR}${countPassed(HEIGHT_EDGES, heights[pixel] ?? 0)}`),
    ],
    ["by each part and its facing", correctBy((pixel) => `${part[pixel * 4]}${ID_SEPARATOR}${getFacing(pixel)}`)],
    [
      `smooth over ${FIELD_RADIUS} pixels`,
      applyPartGains({
        checkIsPart,
        exports,
        getGain: (pixel, channel) => {
          const index = pixel * CHANNELS.length + channel;
          return (blurredReference[index] ?? 0) / Math.max(blurredExports[index] ?? 0, MIN_DENOMINATOR);
        },
      }),
    ],
  ];
  const heightBands = computeHeightBands({ checkIsPart, depth, exports, height, heights, reference, width });
  const ratioMap = await computeRatioMap({ blurredExports, blurredReference, checkIsPart, height, reference, width });
  const drawn = await score(exports);
  const rows: { frame: number; name: string }[] = [];
  for (const [name, corrected] of corrections)
    // oxlint-disable-next-line no-await-in-loop -- One device: FLIP scores on one thread, so each is scored in turn
    rows.push({ frame: await score(corrected), name });
  return { depthEdges: TABLE_DEPTH_EDGES, drawn, heightBands, ratioMap, rows };
};
