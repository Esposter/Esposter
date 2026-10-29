import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferenceEntryPath } from "#src/models/genshinParity/reference/ReferenceEntryPath";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";

// What one `references pack` run did: the files it packed, the files the manifest already held, the files it restored from
// a scratch copy, the files with no screenshot here, the ids refused for a missing input (exit 1), the files it wrote (none
// in a dry run), the ids whose rows it replaced, the collisions it left out, and the scratch screenshots no entry names,
// left where they are
export interface ReferencePackOutcome {
  held: ReferenceEntryPath[];
  missing: ReferenceEntryPath[];
  packed: ReferencePackFile[];
  refused: ReferenceEntryPath[];
  replaced: string[];
  restored: ReferenceEntryPath[];
  skipped: ReferenceCollision[];
  unnamed: { bytes: number; count: number };
  written: number;
}
