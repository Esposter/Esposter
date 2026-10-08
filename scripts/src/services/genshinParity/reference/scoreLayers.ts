import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";
import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Vector } from "#src/models/shared/Vector";

import { computeLayerMasks } from "#src/services/genshinParity/reference/computeLayerMasks";
import { scoreDetail } from "#src/services/genshinParity/reference/scoreDetail";
import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";
import { BYTE } from "#src/services/shared/constants";
import { toLab } from "#src/services/shared/toLab";
import { toLinear } from "#src/services/shared/toLinear";
import { toXyz } from "#src/services/shared/toXyz";
import sharp from "sharp";

// An image's pixels at the structure's size, three channels each
const readPixels = (image: Buffer, height: number): Promise<Buffer> =>
  sharp(image).resize(STRUCTURE_WIDTH, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
// A shot scored against its reference layer by layer, both cut to the reference's scored region and read at the
// Structure's width as `compare` scores its row, so the frame's layer is that row, each other layer over its own pixels
// (`computeLayerMasks`): the CIELab distance between their mean colours, its shape, tone and detail over its pixels
// Alone, and the FLIP error averaged over them, read once over the region as on a full screen. The frame itself is the
// First row
export const scoreLayers = async (
  reference: Buffer,
  shot: Buffer,
  gbuffer: WitnessGbuffer,
  // The region both images are cut from, in the frame's own pixels, and the frame's size
  region: ParityRegion,
  frame: { height: number; width: number },
): Promise<LayerScore[]> => {
  const { height: regionHeight, width: regionWidth } = await sharp(reference).metadata();
  const height = Math.round((STRUCTURE_WIDTH / regionWidth) * regionHeight);
  const pixelCount = STRUCTURE_WIDTH * height;
  const masks = computeLayerMasks(gbuffer, region, frame, height);
  const [{ errorMap }, referencePixels, shotPixels] = await Promise.all([
    readFlipErrorMap(reference, shot, STRUCTURE_WIDTH, height),
    readPixels(reference, height),
    readPixels(shot, height),
  ]);
  // An image's mean colour over a mask in CIELab, its pixels decoded to linear light before they are averaged
  const readMeanLab = (pixels: Buffer, mask: Uint8Array | undefined): Vector => {
    const sum: Vector = [0, 0, 0];
    let count = 0;
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      if (mask && !mask[pixel]) continue;
      for (const channel of [0, 1, 2] as const) sum[channel] += toLinear((pixels[pixel * 3 + channel] ?? 0) / BYTE);
      count++;
    }
    return toLab(toXyz(sum.map((value) => value / Math.max(count, 1)) as Vector));
  };
  return Promise.all(
    masks.map(async ({ mask, name }) => {
      const [{ edgeScore, toneDifference }, detail] = await Promise.all([
        scoreStructure(reference, shot, mask),
        scoreDetail(reference, shot, mask),
      ]);
      let flipSum = 0;
      let count = 0;
      for (const [pixel, error] of errorMap.entries())
        if (!mask || mask[pixel]) {
          flipSum += error;
          count++;
        }
      const [referenceLightness, referenceA, referenceB] = readMeanLab(referencePixels, mask);
      const [shotLightness, shotA, shotB] = readMeanLab(shotPixels, mask);
      return {
        colour: Math.hypot(referenceLightness - shotLightness, referenceA - shotA, referenceB - shotB),
        coverage: count / pixelCount,
        detail,
        flip: flipSum / Math.max(count, 1),
        name,
        shape: edgeScore,
        tone: toneDifference,
      };
    }),
  );
};
