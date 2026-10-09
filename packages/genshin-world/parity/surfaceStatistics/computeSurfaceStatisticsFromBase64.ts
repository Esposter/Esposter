import type { SurfaceStatisticsInput } from "#parity/surfaceStatistics/SurfaceStatisticsInput";

import { computeSurfaceStatistics } from "#parity/surfaceStatistics/computeSurfaceStatistics";
import { decodeBase64 } from "#parity/surfaceStatistics/decodeBase64";

// The host's form of the input: the values' and the mask's bytes, each base64, beside their sizes and sigmas
export interface EncodedSurfaceStatisticsInput extends Omit<SurfaceStatisticsInput, "mask" | "values"> {
  mask: string;
  values: string;
}

// The statistics read from base64 bytes, as the page's host hands them over
export const computeSurfaceStatisticsFromBase64 = async ({
  mask,
  values,
  ...rest
}: EncodedSurfaceStatisticsInput): Promise<number[]> => {
  const [valueBytes, maskBytes] = await Promise.all([decodeBase64(values), decodeBase64(mask)]);
  return computeSurfaceStatistics({ ...rest, mask: new Uint8Array(maskBytes), values: new Float32Array(valueBytes) });
};
