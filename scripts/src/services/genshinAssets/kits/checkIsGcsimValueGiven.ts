import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { checkIsNoActionFileCandidate } from "#src/services/genshinAssets/kits/candidates/checkIsNoActionFileCandidate";

// Whether gcsim gives a kit's value, read from its file, or the shared rule gives it where gcsim has no file for it, a
// Claymore's charged attack, which is no gap in gcsim
export const checkIsGcsimValueGiven = (candidates: readonly KitCandidate[] | undefined): boolean =>
  candidates?.some(
    (candidate) => candidate.provenance.source === KitSource.Gcsim || checkIsNoActionFileCandidate(candidate),
  ) === true;
