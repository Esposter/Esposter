import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";

// The writer of the plunges a character borrows from the plunge fallback's file, each candidate cited there as
// NoActionFile
export const createGcsimPlungeFallbackWriter = (
  candidateMap: Map<string, KitCandidate[]>,
  plungeFallback: GcsimCharacter,
  tables: KitTables,
): GcsimKitCandidateWriter =>
  createGcsimKitCandidateWriter(candidateMap, plungeFallback, tables, KitProvisionalCause.NoActionFile);
