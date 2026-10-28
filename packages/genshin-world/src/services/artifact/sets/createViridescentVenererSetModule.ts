import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { getOwnReactionDamageBonus } from "#src/services/artifact/sets/getOwnReactionDamageBonus";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const VIRIDESCENT_VENERER_RES_ID = `viridescentVenerer${ID_SEPARATOR}res`;

// Viridescent Venerer's four-piece. It raises the DMG the wearer's own Swirl reactions deal by the first param, and each Swirl
// The wearer triggers while it is the active character lowers the RES of the element it swirls by the second param for the
// Third param's seconds, as a Stellar Swirl lowers Cryo RES by the same. Each element's debuff is one, refreshed rather than
// Stacked, as gcsim's vvfunc keys its debuff by element. The fourth param is the Stellar Swirl's own DMG bonus, which the Stellar
// Swirl's party hook raises in its Glimmer term, as gcsim's wearer-only ReactBonus does for DirectStellarSwirl
export const createViridescentVenererSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const swirlDamageBonus = takeOne(bonus.params, 0);
  const resistanceReduction = takeOne(bonus.params, 1);
  const resistanceSeconds = takeOne(bonus.params, 2);
  const stellarSwirlDamageBonus = takeOne(bonus.params, 3);
  const reactionTypeDamageBonusMap = new Map<ReactionType, number>([
    [StellarReactionType.StellarSwirl, stellarSwirlDamageBonus],
    [TransformativeReactionType.Swirl, swirlDamageBonus],
  ]);
  const reduceResistance = (enemy: Enemy, element: Element): void => {
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: `${VIRIDESCENT_VENERER_RES_ID}${ID_SEPARATOR}${element}`,
      resistanceReduction: { [element]: resistanceReduction },
      secondsRemaining: resistanceSeconds,
    });
  };
  return {
    getPartyReactionBonus: (member, reaction) =>
      getOwnReactionDamageBonus(member, reaction, reactionTypeDamageBonusMap),
    onKitEvent: (event, context, combatant) => {
      if (
        !checkIsOwnReactionTriggered(event, combatant) ||
        getActiveCharacterId(context.party) !== combatant.characterId
      )
        return;
      for (const { element, reactionType } of event.reactions)
        if (reactionType === TransformativeReactionType.Swirl && element !== undefined)
          reduceResistance(event.enemy, element);
        else if (reactionType === StellarReactionType.StellarSwirl) reduceResistance(event.enemy, Element.Cryo);
    },
  };
};
