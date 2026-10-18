import type { Combatant } from "#src/models/kit/Combatant";

// A built combatant of the deployed team as a passive reads it: the combatant itself, and whether it is the character on the
// Field, which a passive gated on the field reads
export interface DeployedCombatant extends Combatant {
  isOnField: boolean;
}
