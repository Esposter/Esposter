import type { KitContext } from "#src/models/kit/KitContext";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Each deployed member's kit stepped with the step's seconds, on the field or off it, for a clock a constellation keeps
// While its character stands in the team. A member outside the deployed team has none stepped
export const stepDeployedKits = (context: KitContext, stepSeconds: number): void => {
  const { characterIdCombatantMap, party } = context;
  for (const characterId of getDeployedCharacterIds(party)) {
    const combatant = characterIdCombatantMap.get(characterId);
    combatant?.kit.onStep?.(context, combatant, stepSeconds);
  }
};
