import type { FilePresignedUrlEntity } from "@esposter/db-schema";

// The write target for one resource file, addressed by its hash. A file the resource already holds under that hash
// Reports isHeld with an empty presignedUrl: nothing is signed or reserved, and the client skips the upload
export interface ResourceFilePresignedUrlEntity extends FilePresignedUrlEntity {
  isHeld: boolean;
}
