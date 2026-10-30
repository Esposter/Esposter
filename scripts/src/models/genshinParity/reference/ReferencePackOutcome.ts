import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferenceEntryPath } from "#src/models/genshinParity/reference/ReferenceEntryPath";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";

// What one `references pack` run did: the files it packed, and the files the manifest already held.
// The files it restored from a scratch copy are counted apart, as are the files with no screenshot here.
// The ids refused for a missing input (exit 1) are listed, and so are the ids whose rows it replaced.
// It counts the files it wrote, none in a dry run, and the collisions it left out.
// The scratch screenshots no entry names are left where they are, and their bytes and count are reported.
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
