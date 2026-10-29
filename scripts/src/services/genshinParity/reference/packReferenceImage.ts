import type { OutputInfo, Sharp } from "sharp";

import { REFERENCE_WEBP_OPTIONS } from "#src/services/genshinParity/reference/constants";

// An image packed as the lossless WebP every committed reference is, with the size its encoded file reads as
export const packReferenceImage = (image: Sharp): Promise<{ data: Buffer; info: OutputInfo }> =>
  image.webp(REFERENCE_WEBP_OPTIONS).toBuffer({ resolveWithObject: true });
