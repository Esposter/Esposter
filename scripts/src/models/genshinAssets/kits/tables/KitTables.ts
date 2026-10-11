import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { CombatTalent, Element, TalentMultiplierMap, WeaponType } from "genshin-world";

// What the builder reads of one character from the published tables: its English name, element and weapon, its combat
// Talents' proud skill groups, their multipliers, and each group's labels
export interface KitTables {
  characterId: number;
  element?: Element;
  labelMap: Map<number, KitTableLabel[]>;
  name: string;
  talentGroupIdMap: Record<CombatTalent, number>;
  talentMultiplierMap: TalentMultiplierMap;
  weaponType: WeaponType;
}
