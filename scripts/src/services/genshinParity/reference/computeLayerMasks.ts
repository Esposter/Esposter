import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";
import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";

import { FRAME_LAYER, SKY_LAYER, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";

// Each layer's pixels over a reference's scored region read at the structure's width, so many rows high: the frame's
// Every one (no mask), each family's those whose G-buffer pixel, at the pixel's middle's place in the frame, holds a
// Part of that family, and the sky's those holding none; a layer with no pixel in the region is left out
export const computeLayerMasks = (
  {
    families,
    height: gbufferHeight,
    part,
    width: gbufferWidth,
  }: Pick<WitnessGbuffer, "families" | "height" | "part" | "width">,
  region: ParityRegion,
  frame: { height: number; width: number },
  height: number,
): { mask?: Uint8Array; name: string }[] => {
  const gbufferPixels = Uint32Array.from({ length: STRUCTURE_WIDTH * height }, (_value, pixel) => {
    const frameX = region.x + ((pixel % STRUCTURE_WIDTH) + 0.5) * (region.width / STRUCTURE_WIDTH);
    const frameY = region.y + (Math.floor(pixel / STRUCTURE_WIDTH) + 0.5) * (region.height / height);
    const column = Math.min(gbufferWidth - 1, Math.floor((frameX / frame.width) * gbufferWidth));
    const row = Math.min(gbufferHeight - 1, Math.floor((frameY / frame.height) * gbufferHeight));
    return row * gbufferWidth + column;
  });
  const layers: { mask?: Uint8Array; name: string }[] = [
    { name: FRAME_LAYER },
    ...families.map((name, familyIndex) => ({
      mask: Uint8Array.from(gbufferPixels, (gbufferPixel) =>
        Number(part[gbufferPixel * 4] !== 0 && part[gbufferPixel * 4 + 1] === familyIndex),
      ),
      name: name || "unnamed",
    })),
    { mask: Uint8Array.from(gbufferPixels, (gbufferPixel) => Number(part[gbufferPixel * 4] === 0)), name: SKY_LAYER },
  ];
  return layers.filter(({ mask }) => !mask || mask.includes(1));
};
