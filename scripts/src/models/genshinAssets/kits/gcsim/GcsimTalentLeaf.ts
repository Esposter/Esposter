import type { GcsimTalentReference } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentReference";

// One multiplier of a gcsim talent variable: where it sits in the variable's nesting, `attack[2][1]` at [2, 1], and the
// Multiplier it names
export interface GcsimTalentLeaf {
  path: number[];
  reference: GcsimTalentReference;
}
