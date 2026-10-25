import { readBlockHalf } from "#src/services/genshinParity/passes/readBlockHalf";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// The pixels both part targets draw a family at, as a mask over the pixels, and the half of it ('even' or 'odd' blocks)
export const computeFamilyMask = (
  firstPart: Float32Array,
  secondPart: Float32Array,
  family: number,
  width: number,
  half?: 0 | 1,
): Uint8Array =>
  Uint8Array.from({ length: firstPart.length / 4 }, (_value, pixel) => {
    const isDrawn = readTargetFamily(firstPart, pixel) === family && readTargetFamily(secondPart, pixel) === family;
    if (!isDrawn) return 0;
    if (half === undefined) return 1;
    return readBlockHalf(pixel, width) === half ? 1 : 0;
  });
