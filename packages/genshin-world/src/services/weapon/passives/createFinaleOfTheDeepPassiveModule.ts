import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantPartyMemberBondOfLife } from "#src/services/party/grantPartyMemberBondOfLife";
import { takeOne } from "@esposter/shared";

const FINALE_OF_THE_DEEP_COOLDOWN_ID = "finaleOfTheDeepCooldown";
const FINALE_OF_THE_DEEP_SOURCE = "finaleOfTheDeep";
const FINALE_OF_THE_DEEP_CLEARED_SOURCE = "finaleOfTheDeepCleared";

// Finale of the Deep at its rank: after its wielder uses its Elemental Skill, once every cooldown the rank gives, its ATK rises
// By the rank's percentage for its seconds and it is granted a Bond of Life worth the rank's share of its Max HP. When that Bond
// Of Life is cleared, its flat ATK rises by the rank's rate of the HP the bond cleared, at most the rank's maximum, for its seconds
export const createFinaleOfTheDeepPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercent = takeOne(params, 0);
  const attackSeconds = takeOne(params, 1);
  const bondOfLifeShare = takeOne(params, 2);
  const clearedAttackRate = takeOne(params, 3);
  const clearedAttackMax = takeOne(params, 4);
  const clearedAttackSeconds = takeOne(params, 5);
  const cooldownSeconds = takeOne(params, 6);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.SkillUsed && event.characterId === combatant.characterId) {
        if (
          checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, FINALE_OF_THE_DEEP_COOLDOWN_ID)
        )
          return;
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: FINALE_OF_THE_DEEP_COOLDOWN_ID,
          secondsRemaining: cooldownSeconds,
        });
        buffKitMember(context.kitEffectState, combatant.characterId, {
          amount: attackPercent,
          attribute: Attribute.AttackPercent,
          secondsRemaining: attackSeconds,
          source: FINALE_OF_THE_DEEP_SOURCE,
        });
        grantPartyMemberBondOfLife(context.party, combatant.characterId, bondOfLifeShare);
        return;
      }
      if (event.kind !== KitEventKind.HealthChanged || event.characterId !== combatant.characterId) return;
      // A heal that took no Bond of Life, or left one standing, clears nothing
      if (event.bondOfLifeShare === undefined) return;
      const { bondOfLifeClearedShare = 0, bondOfLifeShare: standingShare } = getPartyMember(
        context.party,
        combatant.characterId,
      );
      if (standingShare) return;
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: Math.min(clearedAttackMax, bondOfLifeClearedShare * combatant.attributes.maxHealth * clearedAttackRate),
        attribute: Attribute.Attack,
        secondsRemaining: clearedAttackSeconds,
        source: FINALE_OF_THE_DEEP_CLEARED_SOURCE,
      });
    },
  };
};
