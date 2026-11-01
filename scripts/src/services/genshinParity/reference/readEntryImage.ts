import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { getCollision } from "#src/services/genshinParity/reference/getCollision";
import { packScratchImage } from "#src/services/genshinParity/reference/packScratchImage";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";

// One screenshot of an entry: its scratch copy packed, checked against the image the manifest holds.
// With no scratch copy beside it, the committed image itself is used, or undefined when neither exists.
// A committed file is trusted by its bytes, not by its presence.
// It is the held image only while its hash is the held hash.
// A file holding other bytes is a collision, and the held image is not kept.
// One such case is a map edit that moved another id's image onto its path.
export const readEntryImage = async (
  scratchPath: string,
  held: ParityReferenceManifestImage | undefined,
  committedPath: string,
): Promise<ReferenceEntryImage | undefined> => {
  const committedSha256 = existsSync(committedPath) ? await sha256File(committedPath) : undefined;
  if (!existsSync(scratchPath)) {
    if (held === undefined || committedSha256 === undefined) return undefined;
    // With no scratch copy the held image is the local claim, so a committed file differing from it is the collision.
    // The claim is kept only while the file still holds it.
    const collision = getCollision(held.sha256, held, committedSha256);
    return {
      bytesBefore: 0,
      collision,
      image: collision === undefined ? held : undefined,
      isNew: false,
      read: () => readFile(committedPath),
    };
  }
  const packed = await packScratchImage(scratchPath);
  const { mtime } = await stat(scratchPath);
  return {
    bytesBefore: packed.sourceBytes,
    capturedAt: mtime,
    collision: getCollision(packed.image.sha256, held, committedSha256),
    image: packed.image,
    isNew: held === undefined,
    read: () => Promise.resolve(packed.data),
    sourceFormat: packed.sourceFormat,
    // A committed file already holding these bytes is not written again, so a pack that changed nothing writes nothing
    stored: committedSha256 === packed.image.sha256 ? undefined : packed.data,
  };
};
