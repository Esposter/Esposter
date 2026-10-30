import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";

// One screenshot of an entry as a pack reads it: the scratch screenshot packed, or the image the manifest already holds.
// Its bytes are read only where a derived image needs them, and `stored` holds the bytes a store must confirm are present.
// `collision` is set in three cases: a scratch copy that packs to other bytes than the held image; with no scratch copy, a
// committed file that differs from the held image; and with no held image, a scratch copy that packs to other bytes than the
// committed file beside it. `image` is undefined when there is no image to keep: with no scratch copy beside it, the committed
// file disagrees with the held image
export interface ReferenceEntryImage {
  bytesBefore: number;
  capturedAt?: Date;
  collision?: Pick<ReferenceCollision, "committed" | "ours">;
  image?: ParityReferenceManifestImage;
  isNew: boolean;
  read: () => Promise<Buffer>;
  sourceFormat?: string;
  stored?: Buffer;
}
