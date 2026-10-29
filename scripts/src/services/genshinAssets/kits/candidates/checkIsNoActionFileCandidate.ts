import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";

// Whether a candidate is a stand-in for a kit gcsim has no file for: the plunge fallback's, or the shared rule's
export const checkIsNoActionFileCandidate = ({ provenance }: KitCandidate): boolean =>
  "cause" in provenance && provenance.cause === KitProvisionalCause.NoActionFile;
