import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";

import { packReferenceImage } from "#src/services/genshinParity/reference/packReferenceImage";
import { sha256Buffer } from "#src/services/genshinParity/reference/sha256Buffer";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

// A scratch screenshot packed as the lossless WebP every stored reference is. Its format is sniffed from its bytes, since
// sharp reads the content rather than the name, and the name only says which entry the screenshot is for
export const packScratchImage = async (
  scratchPath: string,
): Promise<{ data: Buffer; image: ParityReferenceManifestImage; sourceBytes: number; sourceFormat: string }> => {
  const source = await readFile(scratchPath);
  const { format } = await sharp(source).metadata();
  const packed = await packReferenceImage(sharp(source));
  return {
    data: packed.data,
    image: {
      bytes: packed.data.length,
      height: packed.info.height,
      sha256: sha256Buffer(packed.data),
      width: packed.info.width,
    },
    sourceBytes: source.length,
    sourceFormat: format ?? "unknown",
  };
};
