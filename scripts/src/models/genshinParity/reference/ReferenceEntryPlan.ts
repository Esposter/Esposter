import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";
import type { ReferenceStoredFile } from "#src/models/genshinParity/reference/ReferenceStoredFile";

// One reference id's place in a pack: the id, the row it ends with when that changed, the files it writes, the files it
// packed, the files the manifest already held, the files no screenshot is for, and any collision with a committed row. `mainFile`
// is the screenshot's file name as the plan places it, beside its fixture's snapshot or flat under its id
export interface ReferenceEntryPlan {
  collisions: ReferenceCollision[];
  files: ReferenceStoredFile[];
  held: string[];
  id: string;
  mainFile: string;
  missing: string[];
  packed: ReferencePackFile[];
  row?: ParityReferenceManifestRow;
}
