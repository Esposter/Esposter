import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
import { BOUNTIFUL_CORE_REACH_RADIUS, HYPERBLOOM_HOMING_RADIUS } from "#src/services/combat/dendroCore/constants";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { selectNearestEnemy } from "#src/services/kit/selectNearestEnemy";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";

// The Dendro Cores whose seconds ran out bursting on the enemies round them, each priced from its character as the
// Team's buffs leave it: a Bloom's own core about itself, only while the character whose Bloom left it stands in the
// Deployed team, a Bountiful Core about itself within its 6.5 metres, a Burgeon about itself, and a Hyperbloom about
// The enemy nearest the core within 15 metres
export const burstKitDendroCores = (expiredEffects: readonly KitEffect[], context: KitContext): void => {
  const { characterIdCombatantMap, enemyMap, kitEffectState, party } = context;
  for (const effect of expiredEffects) {
    if (effect.kind !== "dendroCore") continue;
    const { characterId, coreKind, position, reactionType } = effect;
    const combatant = characterIdCombatantMap.get(characterId);
    if (
      !combatant ||
      (reactionType === TransformativeReactionType.Bloom &&
        (!getDeployedCharacterIds(party).includes(characterId) || checkIsCharacterDown(party, characterId)))
    )
      continue;
    const target =
      reactionType === TransformativeReactionType.Hyperbloom
        ? selectNearestEnemy(position, enemyMap.values(), HYPERBLOOM_HOMING_RADIUS)
        : effect;
    if (!target) continue;
    const reactionBonus = getDeployedCombatants(party, characterIdCombatantMap).reduce(
      (bonus, member) => bonus + (member.kit.getPartyDendroCoreDamageBonus?.(member, coreKind, context) ?? 0),
      0,
    );
    landKitReactionReaches(
      [
        [
          { position: target.position },
          {
            element: Element.Dendro,
            reachRadius: coreKind === DendroCoreKind.Bountiful ? BOUNTIFUL_CORE_REACH_RADIUS : undefined,
            reactionBonus,
            reactionType,
          },
        ],
      ],
      getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap, context.body.position),
      context,
    );
  }
};
