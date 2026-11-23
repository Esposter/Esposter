import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantPartyMemberBondOfLife } from "#src/services/party/grantPartyMemberBondOfLife";
import { takeOne } from "@esposter/shared";

const ASHEN_SUN_COOLDOWN_ID = "ashenSunsShadowCooldown";

// Ashen Sun's Shadow at its rank: a Charged Attack hit its wielder lands grants it a Bond of Life of the rank's share
// Of its Max HP, once every the rank's cooldown in seconds. While it has a Bond of Life, its DMG is raised by the
// Rank's amount, and by the Rank's last amount more at a Bond of the rank's threshold share of its Max HP or more
export const createAshenSunsShadowPassiveModule = (params: number[]): PassiveModule => {
  const bondShare = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  const damageBonus = takeOne(params, 2);
  const thresholdShare = takeOne(params, 3);
  const thresholdDamageBonus = takeOne(params, 4);
  return {
    getStrikeDamageBonus: (strike, _enemy, party) => {
      const { bondOfLifeShare } = getPartyMember(party, strike.combatant.characterId);
      if (bondOfLifeShare <= 0) return 0;
      return bondOfLifeShare >= thresholdShare ? damageBonus + thresholdDamageBonus : damageBonus;
    },
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === combatant.characterId &&
        event.attackTag === AttackTag.ChargedAttack &&
        startKitCooldown(context.kitEffectState, combatant.characterId, ASHEN_SUN_COOLDOWN_ID, cooldownSeconds)
      )
        grantPartyMemberBondOfLife(context.party, combatant.characterId, bondShare);
    },
  };
};
