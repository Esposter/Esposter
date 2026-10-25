import { saturate } from "#src/services/genshinParity/sky/saturate";

// A curve of evenly spaced samples read linearly at a share from 0 to 1, clamped at its ends
export const getCurve = (samples: readonly number[], share: number): number => {
  const position = saturate(share) * (samples.length - 1);
  const left = Math.floor(position);
  const right = Math.min(left + 1, samples.length - 1);
  return (samples[left] ?? 0) + ((samples[right] ?? 0) - (samples[left] ?? 0)) * (position - left);
};
