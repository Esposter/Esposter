import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";

// What one `references pack` run did: the files it packed, the files the manifest already held, the files no screenshot
// is in the scratch folder for, the files it wrote (none in a dry run), the ids whose rows it replaced, the collisions it
// left out, and the scratch screenshots no entry names, left where they are
export interface ReferencePackOutcome {
  held: string[];
  missing: string[];
  packed: ReferencePackFile[];
  replaced: string[];
  skipped: ReferenceCollision[];
  unnamed: { bytes: number; count: number };
  written: number;
}
