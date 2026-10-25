import { CHANNELS, LUMINANCE } from "#src/services/genshinParity/shared/constants";

export const readLuminance = (linear: Float32Array, pixel: number): number =>
  LUMINANCE.reduce((sum, weight, channel) => sum + weight * (linear[pixel * CHANNELS.length + channel] ?? 0), 0);
