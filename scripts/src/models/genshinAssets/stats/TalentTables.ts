import type { TalentLabelMap, TalentMultiplierMap } from "genshin-world";

// One character's combat talent tables, keyed by the character's avatar id: its multipliers and its labels
export interface TalentTables {
  characterId: number;
  labelMap: TalentLabelMap;
  multiplierMap: TalentMultiplierMap;
}
