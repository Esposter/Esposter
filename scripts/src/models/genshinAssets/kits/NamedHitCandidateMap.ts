import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

// A named hit's candidates, joined from its multiplier's proud skill group and index: its fields by name, its element,
// Gauge, tag, poise and strike type, and the candidates each queue call of its attack gives, in the order they are
// Called, a named list of as many hits as calls taking them in order
export interface NamedHitCandidate {
  fieldMap: Map<string, KitCandidate[]>;
  queuedFieldMaps: Map<string, KitCandidate[]>[];
}

// The named hits keyed by their multiplier's `<proud skill group>|<index>`
export type NamedHitCandidateMap = Map<string, NamedHitCandidate>;
