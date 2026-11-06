import { BLOOM_REACH_PIXELS } from "#src/services/genshinParity/passes/constants";
import { dilateMask } from "#src/services/recreation/image/dilateMask";
import { BYTE } from "#src/services/shared/constants";

// The pixels within BLOOM_REACH_PIXELS of one the reference shows at the curve's white, every channel at BYTE, as a
// Mask of ones and zeros: the white pixels dilated by the reach
export const computeBloomRegion = (reference: Buffer, width: number, height: number): Uint8Array => {
  const whites = Uint8Array.from({ length: width * height }, (_value, pixel) =>
    [0, 1, 2].every((channel) => reference[pixel * 3 + channel] === BYTE) ? 1 : 0,
  );
  return dilateMask(whites, width, height, BLOOM_REACH_PIXELS);
};
