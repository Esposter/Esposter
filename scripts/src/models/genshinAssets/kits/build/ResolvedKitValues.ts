import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

// A kit's values once its sources, overlay and rules are resolved, by path: every candidate each path has, rules last,
// The value chosen for it, undefined where the overlay removes one, and how that value is known
export interface ResolvedKitValues {
  candidateMap: Map<string, KitCandidate[]>;
  provenanceMap: Map<string, KitValueSource>;
  valueMap: Map<string, unknown>;
}
