import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";
import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Vector } from "#src/models/shared/Vector";

import { scoreDetail } from "#src/services/genshinParity/reference/scoreDetail";
import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import { FRAME_LAYER, SKY_LAYER, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
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
// Structure's width as `compare` scores its row, so the frame's layer is that row: each layer the pixels the witness's
// Part target gives one family of the scene's parts, each pixel's family read off the G-buffer at its place in the
// Frame, and the sky the pixels no part covers. Each has the CIELab distance between their mean colours, its shape,
// Tone and detail over its pixels alone, and the FLIP error averaged over them, read once over the region as on a full
// Screen. The frame itself is the first row
export const scoreLayers = async (
  reference: Buffer,
  shot: Buffer,
  { families, height: gbufferHeight, part, width: gbufferWidth }: WitnessGbuffer,
  // The region both images are cut from, in the frame's own pixels, and the frame's size
  region: ParityRegion,
  frame: { height: number; width: number },
): Promise<LayerScore[]> => {
  const { height: regionHeight = 0, width: regionWidth = 0 } = await sharp(reference).metadata();
  const height = Math.round((STRUCTURE_WIDTH / regionWidth) * regionHeight);
  const pixelCount = STRUCTURE_WIDTH * height;
  // Each pixel's G-buffer pixel, at the pixel's middle's place in the frame
  const gbufferPixels = Uint32Array.from({ length: pixelCount }, (_value, pixel) => {
    const frameX = region.x + ((pixel % STRUCTURE_WIDTH) + 0.5) * (region.width / STRUCTURE_WIDTH);
    const frameY = region.y + (Math.floor(pixel / STRUCTURE_WIDTH) + 0.5) * (region.height / height);
    const column = Math.min(gbufferWidth - 1, Math.floor((frameX / frame.width) * gbufferWidth));
    const row = Math.min(gbufferHeight - 1, Math.floor((frameY / frame.height) * gbufferHeight));
    return row * gbufferWidth + column;
  });
  const masks = [
    { mask: undefined, name: FRAME_LAYER },
    ...families.map((name, familyIndex) => ({
      mask: Uint8Array.from(gbufferPixels, (gbufferPixel) =>
        Number(part[gbufferPixel * 4] !== 0 && part[gbufferPixel * 4 + 1] === familyIndex),
      ),
      name: name || "unnamed",
    })),
    { mask: Uint8Array.from(gbufferPixels, (gbufferPixel) => Number(part[gbufferPixel * 4] === 0)), name: SKY_LAYER },
  ].filter(({ mask }) => !mask || mask.includes(1));
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
