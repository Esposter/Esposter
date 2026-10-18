import type { Combatant } from "#src/models/kit/Combatant";

// The extra skill charge a constellation gives, from the constellation that adds it on and every one above it
export const createConstellationSkillChargeBonus = (constellation: number) => (combatant: Combatant) =>
  combatant.constellationCount >= constellation ? 1 : 0;
