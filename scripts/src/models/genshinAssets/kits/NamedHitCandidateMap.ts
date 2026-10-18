import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

// One queue call of a named hit's attack: the declaration it is made from, its damage delay and the candidates its hitbox
// And delay give
export interface NamedHitCall {
  delay?: number;
  fieldMap: Map<string, KitCandidate[]>;
  site: string;
}

// A named hit's candidates, joined from its multiplier's proud skill group and index: its fields by name, its element,
// Gauge, tag, poise and strike type, and the calls its talent variable's attacks make, in the order they land
export interface NamedHitCandidate {
  fieldMap: Map<string, KitCandidate[]>;
  queuedCalls: NamedHitCall[];
}

// The named hits keyed by their multiplier's `<proud skill group>|<index>`
export type NamedHitCandidateMap = Map<string, NamedHitCandidate>;
