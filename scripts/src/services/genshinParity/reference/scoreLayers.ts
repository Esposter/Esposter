import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
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

// A layer's mask at the G-buffer's size laid onto the structure's width its shape and detail are read at, which the
// Page's whole-pixel viewport can leave a pixel off the G-buffer's
const toStructureMask = (mask: Uint8Array, width: number, height: number): Promise<Uint8Array> =>
  sharp(mask, { raw: { channels: 1, height, width } })
    .resize(STRUCTURE_WIDTH, height, { fit: "fill", kernel: "nearest" })
    .toColourspace("b-w")
    .raw()
    .toBuffer();
// An image's pixels at the G-buffer's size, three channels each
const readPixels = (image: Buffer, width: number, height: number): Promise<Buffer> =>
  sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
// A shot scored against its reference layer by layer, each layer the pixels the witness's part target gives one family
// Of the scene's parts, and the sky the pixels no part covers: the CIELab distance between their mean colours, its
// Shape, tone and detail over its pixels alone, and the FLIP error averaged over them, read once over the whole frame
// At the G-buffer's size as on a full screen. The frame itself is the first row
export const scoreLayers = async (reference: Buffer, shot: Buffer, gbuffer: WitnessGbuffer): Promise<LayerScore[]> => {
  const { families, height, part, width } = gbuffer;
  const pixelCount = width * height;
  const masks = [
    { mask: undefined, name: FRAME_LAYER },
    ...families.map((name, familyIndex) => ({
      mask: Uint8Array.from({ length: pixelCount }, (_value, pixel) =>
        Number(part[pixel * 4] !== 0 && part[pixel * 4 + 1] === familyIndex),
      ),
      name: name || "unnamed",
    })),
    {
      mask: Uint8Array.from({ length: pixelCount }, (_value, pixel) => Number(part[pixel * 4] === 0)),
      name: SKY_LAYER,
    },
  ].filter(({ mask }) => !mask || mask.includes(1));
  const [{ errorMap }, referencePixels, shotPixels] = await Promise.all([
    readFlipErrorMap(reference, shot, width, height),
    readPixels(reference, width, height),
    readPixels(shot, width, height),
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
      const structureMask = mask && (await toStructureMask(mask, width, height));
      const [{ edgeScore, toneDifference }, detail] = await Promise.all([
        scoreStructure(reference, shot, structureMask),
        scoreDetail(reference, shot, structureMask),
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
