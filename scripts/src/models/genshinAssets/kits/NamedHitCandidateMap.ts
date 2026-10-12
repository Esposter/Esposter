import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

// The hits a named list's multiplier joins to, keyed by the multiplier's `<proud skill group>|<index>`, each with the
// Candidates for its fields by name: its element, gauge, tag, poise and strike type
export type NamedHitCandidateMap = Map<string, Map<string, KitCandidate[]>>;
