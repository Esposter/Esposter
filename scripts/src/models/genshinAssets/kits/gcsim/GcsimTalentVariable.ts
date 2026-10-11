import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";

// A talent variable a gcsim config's `talents` declares, `attack` or `pyronadoInitial`: its multipliers in the order
// The config lists them, and the config line naming it
export interface GcsimTalentVariable {
  leaves: GcsimTalentLeaf[];
  line: number;
  name: string;
}
