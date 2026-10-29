import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCall } from "#src/models/genshinAssets/kits/NamedHitCall";

// A named hit's candidates, joined from its multiplier's proud skill group and index: its fields by name, its element,
// Gauge, tag and poise, and the calls its talent variable's attacks make, in the order they land
export interface NamedHitCandidate {
  fieldMap: Map<string, KitCandidate[]>;
  queuedCalls: NamedHitCall[];
}
