import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";

// One screenshot of an entry as a pack reads it: the scratch screenshot packed, or the image the manifest already holds.
// Its bytes are read only where a derived image needs them, and `stored` holds the bytes a store must confirm are present.
// `collision` is set when a scratch copy packs to other bytes than the held image.
// With no scratch copy, `collision` is set when a committed file differs from the held image.
// With no held image, `collision` is set when a scratch copy packs to other bytes than the committed file beside it.
// `image` is undefined when there is no image to keep.
// That is the case with no scratch copy beside it, where the committed file disagrees with the held image
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
