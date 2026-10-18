import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import type { Attribute } from "#src/models/character/Attribute";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantPartyMemberBondOfLife } from "#src/services/party/grantPartyMemberBondOfLife";
import { takeOne } from "@esposter/shared";

export interface BondOfLifeSkillPassiveOptions {
  clearedAttributes: readonly Attribute[];
  // The amount each cleared attribute rises by, from the HP the Bond of Life cleared, the rank's rate of it and the rank's maximum
  priceClearedAmount: (clearedHealth: number, rate: number, max: number) => number;
  skillAttributes: readonly Attribute[];
  source: string;
}

// A passive that, after its wielder uses its Elemental Skill, once every cooldown the rank gives, raises its skill attributes by
// The rank's amount for the rank's seconds and grants it a Bond of Life worth the rank's share of its Max HP. When that Bond of
// Life is cleared, its cleared attributes rise by the amount the cleared HP is priced at, for the rank's cleared seconds
export const createBondOfLifeSkillPassiveModule = (
  params: number[],
  { clearedAttributes, priceClearedAmount, skillAttributes, source }: BondOfLifeSkillPassiveOptions,
): WeaponPassiveModule => {
  const skillAmount = takeOne(params, 0);
  const skillSeconds = takeOne(params, 1);
  const bondOfLifeShare = takeOne(params, 2);
  const clearedRate = takeOne(params, 3);
  const clearedMax = takeOne(params, 4);
  const clearedSeconds = takeOne(params, 5);
  const cooldownSeconds = takeOne(params, 6);
  const cooldownId = `${source}Cooldown`;
  const clearedSource = `${source}Cleared`;
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.SkillUsed && event.characterId === combatant.characterId) {
        if (checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, cooldownId)) return;
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: cooldownId,
          secondsRemaining: cooldownSeconds,
        });
        for (const attribute of skillAttributes)
          buffKitMember(context.kitEffectState, combatant.characterId, {
            amount: skillAmount,
            attribute,
            secondsRemaining: skillSeconds,
            source,
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
      const amount = priceClearedAmount(
        bondOfLifeClearedShare * combatant.attributes.maxHealth,
        clearedRate,
        clearedMax,
      );
      for (const attribute of clearedAttributes)
        buffKitMember(context.kitEffectState, combatant.characterId, {
          amount,
          attribute,
          secondsRemaining: clearedSeconds,
          source: clearedSource,
        });
    },
  };
};
