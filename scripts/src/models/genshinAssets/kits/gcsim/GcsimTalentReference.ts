import type { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";

// One multiplier a gcsim config's `talents` names, `attack(Low/High Plunge DMG|1)`: its talent, its label in the
// Talent's table, and which of the label's parameters it is, the first unless a `|` selects another
export interface GcsimTalentReference {
  label: string;
  selector: number;
  type: GcsimTalentType;
}
