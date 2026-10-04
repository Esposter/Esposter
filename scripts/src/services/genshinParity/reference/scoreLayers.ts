import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";

import { scoreDetail } from "#src/services/genshinParity/reference/scoreDetail";
import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import { SKY_LAYER } from "#src/services/genshinParity/shared/constants";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";

// A shot scored against its reference layer by layer, each layer the pixels the witness's part target gives one family
// Of the scene's parts, and the sky the pixels no part covers: its shape, tone and detail over its pixels alone, and
// The FLIP error averaged over them, read once over the whole frame at the G-buffer's size as on a full screen. The
// Frame itself is the first row
export const scoreLayers = async (reference: Buffer, shot: Buffer, gbuffer: WitnessGbuffer): Promise<LayerScore[]> => {
  const { families, height, part, width } = gbuffer;
  const pixelCount = width * height;
  const masks = [
    { mask: undefined, name: "frame" },
    ...families.map((name, familyIndex) => ({
      mask: Uint8Array.from({ length: pixelCount }, (_, pixel) =>
        Number(part[pixel * 4] !== 0 && part[pixel * 4 + 1] === familyIndex),
      ),
      name: name || "unnamed",
    })),
    { mask: Uint8Array.from({ length: pixelCount }, (_, pixel) => Number(part[pixel * 4] === 0)), name: SKY_LAYER },
  ].filter(({ mask }) => !mask || mask.includes(1));
  const { errorMap } = await readFlipErrorMap(reference, shot, width, height);
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
      return {
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
