import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { packScratchImage } from "#src/services/genshinParity/reference/packScratchImage";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";

// One screenshot of an entry: its scratch copy packed, checked against the image the manifest holds, or the committed image
// itself when no scratch copy is beside it. Undefined when neither exists. A scratch copy packing to other bytes than the
// held one is a collision, since two different images cannot claim one id
export const readEntryImage = async (
  scratchPath: string,
  existing: ParityReferenceManifestImage | undefined,
  committedPath: string,
): Promise<ReferenceEntryImage | undefined> => {
  if (!existsSync(scratchPath)) {
    if (existing === undefined || !existsSync(committedPath)) return undefined;
    return { bytesBefore: 0, image: existing, isNew: false, read: async () => readFile(committedPath) };
  }
  const packed = await packScratchImage(scratchPath);
  const { mtime } = await stat(scratchPath);
  const isCollision = existing !== undefined && existing.sha256 !== packed.image.sha256;
  return {
    bytesBefore: packed.sourceBytes,
    capturedAt: mtime,
    collision: isCollision ? { committed: existing.sha256, ours: packed.image.sha256 } : undefined,
    image: packed.image,
    isNew: existing === undefined,
    read: async () => packed.data,
    sourceFormat: packed.sourceFormat,
    stored: packed.data,
  };
};
