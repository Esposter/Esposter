import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { landReactionReach } from "#src/services/kit/landReactionReach";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { startPartyLunarReactions } from "#src/services/party/startPartyLunarReactions";

// The reactions that landed with a reach, each with the enemy it landed on or the Dendro Core it burst from, reaching
// The enemies round it, priced from the combatant that triggered them, as the party's Moonsign turns them Lunar. Each
// Enemy reached drops its energy to the team, a Bloom there leaves its Dendro Core, a Lunar reaction there is the party's
// To answer, its reactions are sent to the deployed team's kits, and those of them that reach are reached in turn
export const landKitReactionReaches = (
  reaches: [Pick<Enemy, "position">, TransformativeReaction][],
  combatant: Combatant,
  context: KitContext,
): void => {
  const { characterIdCombatantMap, enemyMap, enemyTables, kitEffectState, party, random } = context;
  if (reaches.length === 0) return;
  const { lunarReactionTypes } = getPartyMoonsign(characterIdCombatantMap, kitEffectState.effects, party);
  for (const [origin, reaction] of reaches)
    for (const [enemy, { energyDrops, reachingReactions, reactions }] of landReactionReach(
      enemyTables,
      origin,
      enemyMap.values(),
      reaction,
      combatant,
      lunarReactionTypes,
    )) {
      collectKitEnergyDrops(energyDrops, combatant.element, context);
      addSprawlingGreeneryBuffs(kitEffectState, party, combatant, reactions);
      addDendroCores(kitEffectState, enemy, combatant, reactions, random);
      startPartyLunarReactions(party, reactions);
      for (const reachingReaction of reachingReactions) reaches.push([enemy, reachingReaction]);
      if (reactions.length > 0)
        emitKitEvent({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant }, context);
    }
};
