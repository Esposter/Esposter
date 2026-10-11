import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";
import type { CombatTalent } from "genshin-world";

// One of a character's combat talent pages on the wiki, at the revision read: its title, revision id, the talent its
// Infobox names and its Advanced Properties rows
export interface WikiTalentPage {
  combatTalent: CombatTalent;
  properties: WikiAdvancedProperty[];
  revisionId: number;
  title: string;
}
