import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";

// What one `references pack` run did: the files it packed, the files the manifest already held, the files no screenshot
// is in the scratch folder for, the objects it had to store and how many of those each account lacked, the ids whose rows
// it replaced, the collisions it left out, and the scratch screenshots no entry names, left where they are
export interface ReferencePackOutcome {
  held: string[];
  missing: string[];
  objects: number;
  packed: ReferencePackFile[];
  replaced: string[];
  skipped: ReferenceCollision[];
  unnamed: { bytes: number; count: number };
  uploads: number;
}
