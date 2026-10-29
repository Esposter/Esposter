import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { packScratchImage } from "#src/services/genshinParity/reference/packScratchImage";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";

// The pair a scratch copy or a committed file disagrees with: the held image when one is held, since the id is held under
// its hash, and the committed file otherwise. A scratch copy that differs from the held hash is the first disagreement, then
// a committed file that differs from it, and with no held image a committed file that differs from the scratch copy
const getCollision = (
  ours: string,
  held: ParityReferenceManifestImage | undefined,
  committedSha256: string | undefined,
): ReferenceEntryImage["collision"] => {
  if (held === undefined)
    return committedSha256 === undefined || committedSha256 === ours ? undefined : { committed: committedSha256, ours };
  if (held.sha256 !== ours) return { committed: held.sha256, ours };
  if (committedSha256 !== undefined && committedSha256 !== held.sha256)
    return { committed: committedSha256, ours: held.sha256 };
  return undefined;
};

// One screenshot of an entry: its scratch copy packed, checked against the image the manifest holds, or the committed image
// itself when no scratch copy is beside it. Undefined when neither exists. A committed file is trusted by its bytes, not by
// its presence: it is the held image only while its hash is the held hash, so a file holding other bytes (a map edit moved
// another id's image onto its path) is a collision, and the held image is not kept
export const readEntryImage = async (
  scratchPath: string,
  held: ParityReferenceManifestImage | undefined,
  committedPath: string,
): Promise<ReferenceEntryImage | undefined> => {
  const committedSha256 = existsSync(committedPath) ? await sha256File(committedPath) : undefined;
  if (!existsSync(scratchPath)) {
    if (held === undefined || committedSha256 === undefined) return undefined;
    // With no scratch copy the held image is the local claim, so a committed file that differs from it is the collision,
    // and the claim is kept only while the file still holds it
    const collision = getCollision(held.sha256, held, committedSha256);
    return {
      bytesBefore: 0,
      collision,
      image: collision === undefined ? held : undefined,
      isNew: false,
      read: async () => readFile(committedPath),
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
    read: async () => packed.data,
    sourceFormat: packed.sourceFormat,
    // A committed file already holding these bytes is not written again, so a pack that changed nothing writes nothing
    stored: committedSha256 === packed.image.sha256 ? undefined : packed.data,
  };
};
