import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { applyPartGains } from "#src/services/genshinParity/witness/applyPartGains";
import { MIN_DENOMINATOR } from "#src/services/genshinParity/witness/constants";
import { getOrCreate } from "@esposter/shared";

// The exports' parts corrected to the reference's own mean within each bin: each bin's reference sums over its exports'
// Sums, channel by channel, applied to every part pixel the bin holds
export const correctByBins = ({
  checkIsPart,
  count,
  exports,
  getBin,
  reference,
}: {
  checkIsPart: (pixel: number) => boolean;
  count: number;
  exports: Float32Array;
  getBin: (pixel: number) => string;
  reference: Float32Array;
}): Float32Array => {
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
  return applyPartGains({
    checkIsPart,
    exports,
    getGain: (pixel, channel) => {
      const sums = binSumsMap.get(getBin(pixel)) ?? [];
      return (sums[channel] ?? 0) / Math.max(sums[CHANNELS.length + channel] ?? 0, MIN_DENOMINATOR);
    },
  });
};
