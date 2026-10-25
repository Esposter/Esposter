import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { readRelativeLuminance } from "#src/services/genshinAssets/fit/readRelativeLuminance";
import { computeDetailStatistics } from "#src/services/shared/computeDetailStatistics";

// A texture's detail as `SurfaceDetail` holds it: the statistics of its relative luminance over the texels it covers,
// At the metres a texel spans where it is drawn. Undefined for a texture nothing covers
export const computeTextureDetail = (texture: Texture, metresPerTexel: number): SurfaceDetail | undefined => {
  const { mask, values } = readRelativeLuminance(texture);
  const [variance, ...bands] = computeDetailStatistics(values, mask, texture.info.width, texture.info.height);
  return variance === undefined ? undefined : { bands, metresPerTexel, variance };
};
