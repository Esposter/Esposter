import type { PassiveModule } from "#src/models/kit/PassiveModule";

import type { Attribute } from "#src/models/character/Attribute";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantPartyMemberBondOfLife } from "#src/services/party/grantPartyMemberBondOfLife";
import { takeOne } from "@esposter/shared";

interface BondOfLifeSkillPassiveOptions {
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
): PassiveModule => {
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
        if (!startKitCooldown(context.kitEffectState, combatant.characterId, cooldownId, cooldownSeconds)) return;
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
      if (event.bondOfLifeShare === 0) return;
      const { bondOfLifeClearedShare, bondOfLifeShare: standingShare } = getPartyMember(
        context.party,
        combatant.characterId,
      );
      if (standingShare) return;
      const maxHealth = getKitMaxHealth(
        combatant,
        context.kitEffectState.effects,
        context.party,
        context.characterIdCombatantMap,
      );
      const amount = priceClearedAmount(bondOfLifeClearedShare * maxHealth, clearedRate, clearedMax);
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
