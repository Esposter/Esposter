import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";

// Whether gcsim gives a kit's value, read from its file, or the shared rule gives it where gcsim has no file for it, a
// Claymore's charged attack, which is no gap in gcsim
export const checkIsGcsimValueGiven = (candidates: readonly KitCandidate[] | undefined): boolean =>
  candidates?.some(
    ({ provenance }) =>
      provenance.source === KitSource.Gcsim ||
      ("cause" in provenance && provenance.cause === KitProvisionalCause.NoActionFile),
  ) === true;
