import type { CombatTalent } from "genshin-world";

// The hit slot of a folder-less character's record a path names, the talent its labels sit in, and the labels its hits
// Read their multipliers from, in hit order. A label spanning several hits gives one to each of its parameters
export interface KitSlotHitLabels {
  combatTalent: CombatTalent;
  labels: readonly string[];
}
