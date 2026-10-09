import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { computeDetailStatistics } from "#src/services/shared/computeDetailStatistics";
import { BYTE } from "#src/services/shared/constants";

// A texture's luminance as the mean of its colour channels, over the texels its alpha covers where it has one, scaled
// To its own mean so the statistics are relative. Empty when no texel is covered
const readRelativeLuminance = ({ data, info }: Texture): { mask: Uint8Array; values: Float32Array } => {
  const { channels, height, width } = info;
  const hasAlpha = channels === 2 || channels === 4;
  const colourChannels = hasAlpha ? channels - 1 : channels;
  const mask = Uint8Array.from({ length: width * height }, (_value, texel) =>
    hasAlpha ? ((data[texel * channels + channels - 1] ?? 0) > 0 ? 1 : 0) : 1,
  );
  const values = Float32Array.from({ length: width * height }, (_value, texel) => {
    let sum = 0;
    for (let channel = 0; channel < colourChannels; channel++) sum += data[texel * channels + channel] ?? 0;
    return sum / colourChannels / BYTE;
  });
  let total = 0;
  let count = 0;
  for (const [texel, value] of values.entries())
    if (mask[texel]) {
      total += value;
      count++;
    }
  const mean = count === 0 ? 0 : total / count;
  return { mask, values: mean === 0 ? values : values.map((value) => value / mean) };
};
// A texture's detail as `SurfaceDetail` holds it: the statistics of its relative luminance over the texels it covers,
// Undefined for a texture nothing covers
export const computeTextureDetail = (texture: Texture): SurfaceDetail | undefined => {
  const { mask, values } = readRelativeLuminance(texture);
  const [variance, ...bands] = computeDetailStatistics(values, mask, texture.info.width, texture.info.height);
  return variance === undefined ? undefined : { bands, variance };
};
// The mean of several surfaces' details, each weighted by the area it was sampled over, undefined when none is given or
// None was sampled over any area
export const averageSurfaceDetails = (
  details: readonly { detail: SurfaceDetail; weight: number }[],
): SurfaceDetail | undefined => {
  const [first] = details;
  const totalWeight = details.reduce((sum, { weight }) => sum + weight, 0);
  if (!first || totalWeight <= 0) return undefined;
  return {
    bands: first.detail.bands.map(
      (_band, index) =>
        details.reduce((sum, { detail: { bands }, weight }) => sum + (bands[index] ?? 0) * weight, 0) / totalWeight,
    ),
    variance: details.reduce((sum, { detail: { variance }, weight }) => sum + variance * weight, 0) / totalWeight,
  };
};
