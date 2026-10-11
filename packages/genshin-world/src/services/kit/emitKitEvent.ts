import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

// An event of combat sent to the kit of each member of the deployed team whose combatant is built, on the field or off
// It, each kit reading it as its own character
export const emitKitEvent = (event: KitEvent, context: KitContext): void => {
  const { characterIdCombatantMap, party } = context;
  for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
    const combatant = characterIdCombatantMap.get(characterId);
    combatant?.kit.onKitEvent?.(event, context, combatant);
  }
};
