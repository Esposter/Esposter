import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";

// One screenshot of an entry as a pack reads it: the scratch screenshot packed, or the image the manifest already holds.
// Its bytes are read only where a derived image needs them, and `stored` holds the bytes a store must confirm are present
export interface ReferenceEntryImage {
  bytesBefore: number;
  capturedAt?: Date;
  conflict?: string;
  image: ParityReferenceManifestImage;
  isNew: boolean;
  read: () => Promise<Buffer>;
  sourceFormat?: string;
  stored?: Buffer;
}
