import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { readReactionOreHit } from "#src/services/gathering/readReactionOreHit";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { landReactionReach } from "#src/services/kit/landReactionReach";
import { addPolestarField } from "#src/services/kit/addPolestarField";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { getReactionParticleDrops } from "#src/services/party/getReactionParticleDrops";
import { startPartyLunarReactions } from "#src/services/party/startPartyLunarReactions";

// The reactions that landed with a reach, each with the enemy it landed on or the Dendro Core it burst from, reaching
// The enemies round it, priced from the combatant that triggered them, as the party's Moonsign turns them Lunar. Each
// Enemy reached drops its energy to the team, a Bloom there leaves its Dendro Core, a Lunar reaction there is the party's
// To answer, its reactions are sent to the deployed team's kits, and those of them that reach are reached in turn.
// A reaction whose own hit carries poise, an Overloaded's explosion, strikes the ores in its reach as well, from where
// It landed, once the step's strikes have landed
export const landKitReactionReaches = (
  reaches: [Pick<Enemy, "position">, TransformativeReaction][],
  combatant: Combatant,
  context: KitContext,
): void => {
  const { characterIdCombatantMap, enemyMap, enemyTables, kitEffectState, oreStrikes, party, random } = context;
  if (reaches.length === 0) return;
  const { lunarReactionTypes } = getPartyMoonsign(
    characterIdCombatantMap,
    kitEffectState.effects,
    party,
    context.body.position,
  );
  const stellarReactionTypes = getPartyStellarReactionTypes(characterIdCombatantMap, party);
  for (const [origin, reaction] of reaches) {
    const oreHit = readReactionOreHit(reaction.reactionType);
    if (oreHit) oreStrikes.push({ body: { facing: 0, height: 0, position: origin.position }, hit: oreHit });
    for (const [enemy, { energyDrops, reachingReactions, reactions }] of landReactionReach(
      enemyTables,
      origin,
      enemyMap.values(),
      reaction,
      combatant,
      lunarReactionTypes,
      stellarReactionTypes,
    )) {
      collectKitEnergyDrops(
        [...energyDrops, ...getReactionParticleDrops(party, reactions, combatant.elementalResonances)],
        combatant.element,
        context,
      );
      addSprawlingGreeneryBuffs(kitEffectState, party, combatant, reactions);
      addDendroCores(kitEffectState, enemy, combatant, reactions, random);
      startPartyLunarReactions(party, reactions);
      for (const reachingReaction of reachingReactions) reaches.push([enemy, reachingReaction]);
      addPolestarField(kitEffectState, combatant.characterId, reactions, context.body.position);
      if (reactions.length > 0)
        emitKitEvent({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant }, context);
    }
  }
};
