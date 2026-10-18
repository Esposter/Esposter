import type { Combatant } from "#src/models/kit/Combatant";

// A built combatant of the deployed team as a passive reads it: the combatant itself, the Elemental Energy it holds,
// Which a passive gated on its Energy reads, and whether it is the character on the field, which a passive gated on the
// Field reads
export interface DeployedCombatant extends Combatant {
  energy: number;
  isOnField: boolean;
}
