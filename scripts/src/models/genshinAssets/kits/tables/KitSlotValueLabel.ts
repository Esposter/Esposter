import type { CombatTalent } from "genshin-world";

// The value of a folder-less character's record a path names, the talent and label it reads, and the position in the
// Label's parameters that names it, the first where none is given
export interface KitSlotValueLabel {
  combatTalent: CombatTalent;
  label: string;
  position?: number;
}
