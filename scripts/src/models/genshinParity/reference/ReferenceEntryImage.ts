import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";

// One screenshot of an entry as a pack reads it: the scratch screenshot packed, or the image the manifest already holds.
// Its bytes are read only where a derived image needs them, and `stored` holds the bytes a store must confirm are present.
// `collision` is set when the screenshot disagrees with the image the manifest holds or with the committed file. `image` is
// undefined when there is no image to keep: with no scratch copy beside it, the committed file disagrees with the held image
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
