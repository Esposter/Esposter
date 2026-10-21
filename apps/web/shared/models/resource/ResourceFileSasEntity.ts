import type { FileSasEntity } from "@esposter/db-schema";

// The write target for one resource file, addressed by its hash. A file the resource already holds under that hash
// Reports isHeld with an empty sasUrl: nothing is signed or reserved, and the client skips the upload
export interface ResourceFileSasEntity extends FileSasEntity {
  isHeld: boolean;
}
