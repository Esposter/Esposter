import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { toSrgb } from "#src/services/shared/toSrgb";
import { getOrCreate } from "@esposter/shared";
import sharp from "sharp";

// The edges each binning splits by: depth in metres, the cosine to the light, how far a face turns up and height in
// Metres, each pixel's band the count of edges it passes
const DEPTH_EDGES = [10, 20, 35, 50, 80, 120, 200];
const FACING_EDGES = [-0.6, -0.3, 0, 0.3, 0.6];
const UPWARD_EDGES = [-0.3, 0.3];
const HEIGHT_EDGES = [-20, -10, -5, 0, 5, 10, 20, 40];
// How far the smooth field reaches either side of a pixel, in the structure's pixels
const FIELD_RADIUS = 4;
const MIN_DENOMINATOR = 1e-6;
const countPassed = (edges: readonly number[], value: number): number => edges.filter((edge) => value > edge).length;
// What any light could still recover of a reference's frame: the exports' frame corrected, channel by channel in linear
// Colour, to the reference's own mean over every part pixel of a bin, and scored again. A light, a haze or a grade
// That depends only on what a bin holds can recover no more than its row, so a row that recovers little says the light
// Is spent at that grain and the rest of the parts' error varies inside the bins: by depth, facing and how far a face
// Turns up, by height as well, by each part and its facing, and a field smooth over a few pixels bounding anything
// Smooth. Each row is the frame's FLIP so corrected, beside the exports' frame as drawn
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
}): Promise<{ drawn: number; rows: { frame: number; name: string }[] }> => {
  const count = width * height;
  const readLinear = async (input: Buffer): Promise<Float32Array> => {
    const data = await sharp(input).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
    return Float32Array.from(data, (value) => toLinear(value / BYTE));
  };
  const [reference, exports] = await Promise.all([readLinear(image), readLinear(exportsShot)]);
  const checkIsPart = (pixel: number): boolean => Boolean(part[pixel * 4]) && checkIsScored(pixel, width);
  const score = async (linear: Float32Array): Promise<number> => {
    const encoded = await sharp(
      Buffer.from(Array.from(linear, (value) => Math.round(Math.min(Math.max(toSrgb(value), 0), 1) * BYTE))),
      { raw: { channels: CHANNELS.length, height, width } },
    )
      .png()
      .toBuffer();
    const { errorMap } = await readFlipErrorMap(image, encoded, width, height);
    let [error, scoredCount] = [0, 0];
    for (let pixel = 0; pixel < count; pixel++) {
      if (!checkIsScored(pixel, width)) continue;
      error += errorMap[pixel] ?? 0;
      scoredCount++;
    }
    return error / Math.max(scoredCount, 1);
  };
  // Every part pixel scaled by its own gain, channel by channel, the rest left as drawn
  const applyGains = (getGain: (pixel: number, channel: number) => number): Float32Array =>
    exports.map((value, index) => {
      const pixel = Math.floor(index / CHANNELS.length);
      return checkIsPart(pixel) ? value * getGain(pixel, index % CHANNELS.length) : value;
    });
  const correctByBins = (getBin: (pixel: number) => string): Float32Array => {
    // Each bin's reference sums, then its exports' sums, channel by channel
    const binSumsMap = new Map<string, number[]>();
    for (let pixel = 0; pixel < count; pixel++) {
      if (!checkIsPart(pixel)) continue;
      const sums = getOrCreate(binSumsMap, getBin(pixel), () => Array.from({ length: CHANNELS.length * 2 }, () => 0));
      for (const channel of CHANNELS) {
        sums[channel] = (sums[channel] ?? 0) + (reference[pixel * CHANNELS.length + channel] ?? 0);
        sums[CHANNELS.length + channel] =
          (sums[CHANNELS.length + channel] ?? 0) + (exports[pixel * CHANNELS.length + channel] ?? 0);
      }
    }
    return applyGains((pixel, channel) => {
      const sums = binSumsMap.get(getBin(pixel)) ?? [];
      return (sums[channel] ?? 0) / Math.max(sums[CHANNELS.length + channel] ?? 0, MIN_DENOMINATOR);
    });
  };
  // Each image's mean over the part pixels within the field's reach of each part pixel
  const blurParts = (source: Float32Array): Float32Array => {
    const blurred = new Float32Array(source.length);
    for (let pixel = 0; pixel < count; pixel++) {
      if (!checkIsPart(pixel)) continue;
      const [column, row] = [pixel % width, Math.floor(pixel / width)];
      let neighbourCount = 0;
      for (let rowOffset = -FIELD_RADIUS; rowOffset <= FIELD_RADIUS; rowOffset++)
        for (let columnOffset = -FIELD_RADIUS; columnOffset <= FIELD_RADIUS; columnOffset++) {
          const [neighbourColumn, neighbourRow] = [column + columnOffset, row + rowOffset];
          if (neighbourColumn < 0 || neighbourRow < 0 || neighbourColumn >= width || neighbourRow >= height) continue;
          const neighbour = neighbourRow * width + neighbourColumn;
          if (!checkIsPart(neighbour)) continue;
          neighbourCount++;
          for (const channel of CHANNELS)
            blurred[pixel * CHANNELS.length + channel] =
              (blurred[pixel * CHANNELS.length + channel] ?? 0) + (source[neighbour * CHANNELS.length + channel] ?? 0);
        }
      for (const channel of CHANNELS)
        blurred[pixel * CHANNELS.length + channel] =
          (blurred[pixel * CHANNELS.length + channel] ?? 0) / Math.max(neighbourCount, 1);
    }
    return blurred;
  };
  const getFacing = (pixel: number): number =>
    countPassed(
      FACING_EDGES,
      (normal[pixel * 4] ?? 0) * direction[0] +
        (normal[pixel * 4 + 1] ?? 0) * direction[1] +
        (normal[pixel * 4 + 2] ?? 0) * direction[2],
    );
  const getShading = (pixel: number): string =>
    `${part[pixel * 4 + 1]}/${countPassed(DEPTH_EDGES, depth[pixel * 4] ?? 0)}/${getFacing(pixel)}/${countPassed(UPWARD_EDGES, normal[pixel * 4 + 1] ?? 0)}`;
  const [blurredReference, blurredExports] = [blurParts(reference), blurParts(exports)];
  const corrections: [string, Float32Array][] = [
    ["by depth, facing and how far a face turns up", correctByBins(getShading)],
    [
      "by depth, facing, how far a face turns up and height",
      correctByBins((pixel) => `${getShading(pixel)}/${countPassed(HEIGHT_EDGES, heights[pixel] ?? 0)}`),
    ],
    ["by each part and its facing", correctByBins((pixel) => `${part[pixel * 4]}/${getFacing(pixel)}`)],
    [
      `smooth over ${FIELD_RADIUS} pixels`,
      applyGains((pixel, channel) => {
        const index = pixel * CHANNELS.length + channel;
        return (blurredReference[index] ?? 0) / Math.max(blurredExports[index] ?? 0, MIN_DENOMINATOR);
      }),
    ],
  ];
  const drawn = await score(exports);
  const rows: { frame: number; name: string }[] = [];
  for (const [name, corrected] of corrections)
    // oxlint-disable-next-line no-await-in-loop -- each correction is encoded and scored in turn, holding one map
    rows.push({ frame: await score(corrected), name });
  return { drawn, rows };
};
