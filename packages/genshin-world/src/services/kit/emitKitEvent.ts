import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// An event of combat sent to the kit of each member of the deployed team whose combatant is built, on the field or off
// It, each kit reading it as its own character, and to each field standing, which reads it as its own
export const emitKitEvent = (event: KitEvent, context: KitContext): void => {
  const { characterIdCombatantMap, kitEffectState, party } = context;
  for (const characterId of getDeployedCharacterIds(party)) {
    const combatant = characterIdCombatantMap.get(characterId);
    combatant?.kit.onKitEvent?.(event, context, combatant);
  }
  for (const effect of kitEffectState.effects) if (effect.kind === "field") effect.onEvent?.(event, effect);
};
