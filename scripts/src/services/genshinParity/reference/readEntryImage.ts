import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { packScratchImage } from "#src/services/genshinParity/reference/packScratchImage";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";

// One screenshot of an entry: its scratch copy packed, checked against the image the manifest holds, or the committed image
// itself when no scratch copy is beside it. Undefined when neither exists. A committed file is trusted by its bytes, not by
// its presence: it is the held image only while its hash is the held hash, so a file holding other bytes (a map edit moved
// another id's image onto its path) is a collision. A scratch copy packing to other bytes than the held one, or than the
// committed file it would overwrite, is one too, since two different images cannot claim one id
export const readEntryImage = async (
  scratchPath: string,
  held: ParityReferenceManifestImage | undefined,
  committedPath: string,
): Promise<ReferenceEntryImage | undefined> => {
  const committedSha256 = existsSync(committedPath) ? await sha256File(committedPath) : undefined;
  if (!existsSync(scratchPath)) {
    if (held === undefined || committedSha256 === undefined) return undefined;
    // With no scratch copy the held image is the local claim, so a committed file that differs from it is the collision
    const isCollision = committedSha256 !== held.sha256;
    return {
      bytesBefore: 0,
      collision: isCollision ? { committed: committedSha256, ours: held.sha256 } : undefined,
      image: held,
      isNew: false,
      read: async () => readFile(committedPath),
    };
  }
  const packed = await packScratchImage(scratchPath);
  const { mtime } = await stat(scratchPath);
  // The hash the committed file is held under: the file's own bytes where one is on disk, else the held image's
  const committedClaim = committedSha256 ?? held?.sha256;
  const isCollision =
    committedClaim !== undefined &&
    (committedClaim !== packed.image.sha256 || (held !== undefined && held.sha256 !== packed.image.sha256));
  return {
    bytesBefore: packed.sourceBytes,
    capturedAt: mtime,
    collision: isCollision ? { committed: committedClaim, ours: packed.image.sha256 } : undefined,
    image: packed.image,
    isNew: held === undefined,
    read: async () => packed.data,
    sourceFormat: packed.sourceFormat,
    // A committed file already holding these bytes is not written again, so a pack that changed nothing writes nothing
    stored: committedSha256 === packed.image.sha256 ? undefined : packed.data,
  };
};
