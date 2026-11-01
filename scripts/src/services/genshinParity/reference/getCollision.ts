import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

// The pair a scratch copy or a committed file disagrees with.
// It is the held image when one is held, since the id is held under its hash, and the committed file otherwise.
// A scratch copy that differs from the held hash is the first disagreement.
// Next comes a committed file that differs from it.
// With no held image, a committed file that differs from the scratch copy is the disagreement.
export const getCollision = (
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
