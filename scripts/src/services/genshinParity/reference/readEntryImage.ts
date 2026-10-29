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
  held: ParityReferenceManifestImage | undefined,
  committedPath: string,
): Promise<ReferenceEntryImage | undefined> => {
  if (!existsSync(scratchPath)) {
    if (held === undefined || !existsSync(committedPath)) return undefined;
    return { bytesBefore: 0, image: held, isNew: false, read: async () => readFile(committedPath) };
  }
  const packed = await packScratchImage(scratchPath);
  const { mtime } = await stat(scratchPath);
  const isCollision = held !== undefined && held.sha256 !== packed.image.sha256;
  // A held image already committed under its hash is not written again, so a pack that changed nothing writes nothing
  const isCommitted = held?.sha256 === packed.image.sha256 && existsSync(committedPath);
  return {
    bytesBefore: packed.sourceBytes,
    capturedAt: mtime,
    collision: isCollision ? { committed: held.sha256, ours: packed.image.sha256 } : undefined,
    image: packed.image,
    isNew: held === undefined,
    read: async () => packed.data,
    sourceFormat: packed.sourceFormat,
    stored: isCommitted ? undefined : packed.data,
  };
};
