import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { landReactionReach } from "#src/services/kit/landReactionReach";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";

// The reactions that landed with a reach, each with the enemy it landed on or the Dendro Core it burst from, reaching
// The enemies round it, priced from the combatant that triggered them. Each enemy reached drops its energy to the team,
// A Bloom there leaves its Dendro Core, its reactions are sent to the deployed team's kits, and those of them that reach
// Are reached in turn
export const landKitReactionReaches = (
  reaches: [Pick<Enemy, "position">, TransformativeReaction][],
  combatant: Combatant,
  { characterIdCombatantMap, emit, enemyMap, enemyTables, kitEffectState, party, random }: KitStrikeContext,
): void => {
  for (const [origin, reaction] of reaches)
    for (const [enemy, { energyDrops, reachingReactions, reactions }] of landReactionReach(
      enemyTables,
      origin,
      enemyMap.values(),
      reaction,
      combatant,
    )) {
      for (const energyDrop of energyDrops)
        gainPartyEnergy(party, energyDrop, combatant.element, characterIdCombatantMap);
      addSprawlingGreeneryBuffs(kitEffectState, party, combatant, reactions);
      addDendroCores(kitEffectState, enemy, combatant, reactions, random);
      for (const reachingReaction of reachingReactions) reaches.push([enemy, reachingReaction]);
      if (reactions.length > 0) emit({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant });
    }
};
