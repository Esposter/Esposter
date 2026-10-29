import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferenceEntryPath } from "#src/models/genshinParity/reference/ReferenceEntryPath";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";
import type { ReferenceStoredFile } from "#src/models/genshinParity/reference/ReferenceStoredFile";

// One reference id's place in a pack: the id, the row it ends with when that changed, the files it writes, the files it
// packed, the files the manifest already held, the files it restored from a scratch copy because the committed file was
// absent, the planned paths of the files it has no image for, and any collision with a committed row. `mainPath` is the
// planned path of its screenshot, beside its fixture's snapshot or flat under its id. An id with a missing input is refused
// when the manifest holds it or a scratch copy is beside it: it writes nothing, so no row names a file that is not there
export interface ReferenceEntryPlan {
  collisions: ReferenceCollision[];
  files: ReferenceStoredFile[];
  held: ReferenceEntryPath[];
  id: string;
  mainPath: string;
  missing: string[];
  packed: ReferencePackFile[];
  refused: boolean;
  restored: ReferenceEntryPath[];
  row?: ParityReferenceManifestRow;
}
