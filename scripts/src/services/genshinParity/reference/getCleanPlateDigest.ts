import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { DIGEST_LENGTH } from "#src/services/genshinParity/reference/constants";
import { createHash } from "node:crypto";

// The digest a clean plate is named by: the SHA-256 of the screenshot it is filled from, and the regions it fills.
// Thus a changed screenshot or region is filled again
export const getCleanPlateDigest = (inputSha256: string, regions: ImageRegion[]): string =>
  createHash("sha256").update(inputSha256).update(JSON.stringify(regions)).digest("hex").slice(0, DIGEST_LENGTH);
