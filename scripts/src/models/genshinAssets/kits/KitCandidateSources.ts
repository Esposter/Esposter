import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

// The candidates a kit's record takes from each of its four sources, by path: the named lists' empty hits, the sources'
// Values, the named hits' fields and the rules over what the record holds
export interface KitCandidateSources {
  namedHitCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  namedListCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  ruleCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>;
}
