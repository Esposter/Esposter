import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitEventContext } from "#src/models/kit/KitEventContext";

// An event of combat sent to the kit of each member of the deployed team whose combatant is built, on the field or off
// It, each kit reading it as its own character
export const emitKitEvent = (
  event: KitEvent,
  characterIdCombatantMap: Map<number, Combatant>,
  context: Pick<KitEventContext, "activeCombatant" | "body" | "enemyMap" | "kitEffectState" | "party" | "random">,
): void => {
  const { party } = context;
  for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
    const combatant = characterIdCombatantMap.get(characterId);
    combatant?.kit.onKitEvent?.(event, { ...context, combatant });
  }
};
