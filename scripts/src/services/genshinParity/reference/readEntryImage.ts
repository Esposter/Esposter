import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { getPackConflict } from "#src/services/genshinParity/reference/getPackConflict";
import { packScratchImage } from "#src/services/genshinParity/reference/packScratchImage";
import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";

// One screenshot of an entry: its scratch copy packed, checked against the image the manifest holds, or the held image
// itself when no scratch copy is beside it. Undefined when neither exists. A scratch copy packing to other bytes than the
// held one is a conflict, since two different images cannot claim one id
export const readEntryImage = async (
  label: string,
  scratchPath: string,
  existing: ParityReferenceManifestImage | undefined,
): Promise<ReferenceEntryImage | undefined> => {
  if (!existsSync(scratchPath)) {
    if (existing === undefined) return undefined;
    return {
      bytesBefore: 0,
      image: existing,
      isNew: false,
      read: async () => readFile(await readCachedReference(existing.sha256)),
    };
  }
  const packed = await packScratchImage(scratchPath);
  const { mtime } = await stat(scratchPath);
  return {
    bytesBefore: packed.sourceBytes,
    capturedAt: mtime,
    conflict: existing === undefined ? undefined : getPackConflict(label, packed.image.sha256, existing.sha256),
    image: packed.image,
    isNew: existing === undefined,
    read: async () => packed.data,
    sourceFormat: packed.sourceFormat,
    stored: packed.data,
  };
};
