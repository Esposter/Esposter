import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
import { DENDRO_CORE_LIFETIME_SECONDS, HYPERBLOOM_FLIGHT_SECONDS } from "#src/services/combat/dendroCore/constants";
import { DendroCoreReactionTypeMap } from "#src/services/combat/dendroCore/DendroCoreReactionTypeMap";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";

// The standing Dendro Cores a strike's Electro or Pyro reaches, written in place and priced from the combatant: Electro
// Sends each off as Hyperbloom, landing a second on, and Pyro bursts it as Burgeon at the next step. A core is reached
// As an enemy's capsule is, at its ground point, and a hit that lands on one enemy alone reaches none. A Bountiful
// Core is reached by none, as it cannot be sent off as Hyperbloom or Burgeon
export const strikeKitDendroCores = (
  kitEffectState: KitEffectState,
  party: Party,
  { body, hit, target }: KitStrike,
  combatant: Combatant,
): void => {
  const element = getKitHitElement(hit, combatant);
  const reactionType = element === undefined ? undefined : DendroCoreReactionTypeMap[element];
  if (target || reactionType === undefined || (hit.gauge ?? 0) <= 0) return;
  for (const effect of kitEffectState.effects) {
    if (
      effect.kind !== "dendroCore" ||
      effect.coreKind === DendroCoreKind.Bountiful ||
      effect.reactionType !== TransformativeReactionType.Bloom ||
      effect.secondsRemaining > DENDRO_CORE_LIFETIME_SECONDS ||
      !checkIsInAttackArea(hit.hitArea, body, effect)
    )
      continue;
    effect.characterId = combatant.characterId;
    effect.reactionType = reactionType;
    effect.secondsRemaining = reactionType === TransformativeReactionType.Hyperbloom ? HYPERBLOOM_FLIGHT_SECONDS : 0;
    addSprawlingGreeneryBuffs(kitEffectState, party, combatant, [{ reactionType }]);
  }
};
