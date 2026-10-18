import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { addFallbackPlungeCandidates } from "#src/services/genshinAssets/kits/gcsim/addFallbackPlungeCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";

// The candidates of a character with no gcsim folder: its plunges and collision from the plunge fallback's, as
// NoActionFile, its other values coming from the donors its overlay names
export const getFallbackPlungeKitCandidates = (
  plungeFallback: GcsimCharacter,
  tables: KitTables,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  addFallbackPlungeCandidates(
    createGcsimKitCandidateWriter(candidateMap, plungeFallback, tables, KitProvisionalCause.NoActionFile),
    plungeFallback,
  );
  return candidateMap;
};
