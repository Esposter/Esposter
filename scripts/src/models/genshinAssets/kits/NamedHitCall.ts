import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

// One queue call of a named hit's attack: the declaration it is made from, its damage delay and the candidates its hitbox
// And delay give
export interface NamedHitCall {
  delay?: number;
  fieldMap: Map<string, KitCandidate[]>;
  file: string;
  line: number;
  site: string;
}
