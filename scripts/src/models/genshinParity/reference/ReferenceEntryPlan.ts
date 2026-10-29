import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";
import type { ReferenceStoredObject } from "#src/models/genshinParity/reference/ReferenceStoredObject";

// One reference id's place in a pack: the id, the row it ends with when that changed, the objects it stores, the files it
// packed, the files the manifest already held, the files no screenshot is for, and any collision with a committed row
export interface ReferenceEntryPlan {
  collisions: ReferenceCollision[];
  held: string[];
  id: string;
  missing: string[];
  objects: ReferenceStoredObject[];
  packed: ReferencePackFile[];
  row?: ParityReferenceManifestRow;
}
