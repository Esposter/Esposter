import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { toLuminance } from "#src/services/genshinParity/witness/toLuminance";

export const readLuminance = (linear: Float32Array, pixel: number): number => {
  const offset = pixel * CHANNELS.length;
  return toLuminance(linear[offset] ?? 0, linear[offset + 1] ?? 0, linear[offset + 2] ?? 0);
};
