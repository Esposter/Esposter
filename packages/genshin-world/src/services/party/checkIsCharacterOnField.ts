import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

// Whether a character is on the field of the deployed team, which a passive reads to tell the bonus it has on the field
// From the bonus it has off it
export const checkIsCharacterOnField = (
  deployedCombatants: readonly DeployedCombatant[],
  characterId: number,
): boolean => deployedCombatants.some((member) => member.characterId === characterId && member.isOnField);
