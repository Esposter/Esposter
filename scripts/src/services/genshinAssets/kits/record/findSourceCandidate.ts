import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";

export const findSourceCandidate = (candidates: readonly KitCandidate[], source: KitSource): KitCandidate | undefined =>
  candidates.find(({ provenance }) => provenance.source === source);
