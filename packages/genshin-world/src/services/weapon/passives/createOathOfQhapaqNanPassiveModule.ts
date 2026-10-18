import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const OATH_ID = "oathOfQhapaqNan";
// The reactions that involve Pyro: Vaporize, Melt, Overloaded, Burning and Burgeon name it by their reaction type, and a
// Swirl or a Crystallize names it by the element it spreads or shards
const PYRO_REACTIONS = [
  { reactionType: ReactionType.Burgeon },
  { reactionType: ReactionType.Burning },
  { reactionType: ReactionType.Melt },
  { reactionType: ReactionType.Overloaded },
  { reactionType: ReactionType.Vaporize },
  { element: Element.Pyro, reactionType: ReactionType.Crystallize },
  { element: Element.Pyro, reactionType: ReactionType.Swirl },
];

// Oath of Qhapaq Nan at its rank: after a party member triggers a Pyro-related reaction, on the field or not, the wielder's
// Elemental Skill DMG rises by the rank's amount for the rank's seconds
export const createOathOfQhapaqNanPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.ElementalSkill &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, OATH_ID)
        ? damageBonus
        : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || !checkIsReactionNamed(event.reactions, PYRO_REACTIONS))
        return;
      addKitStatus(kitEffectState, combatant.characterId, { id: OATH_ID, secondsRemaining: seconds });
    },
  };
};
