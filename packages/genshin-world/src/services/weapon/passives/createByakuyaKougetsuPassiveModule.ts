import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const BYAKUYA_KOUGETSU_ID = "byakuyaKougetsu";
const BYAKUYA_KOUGETSU_COOLDOWN_ID = "byakuyaKougetsuCooldown";

// Byakuya Kougetsu at its rank: its Normal Attack DMG rises by the rank's share of the wielder's Max HP as base damage. For the
// Rank's seconds after the wielder uses an Elemental Burst, each Normal Attack it lands restores the rank's Energy to it, once
// Every cooldown. The rank's Healing Bonus line is a table line the weapon carries whatever its conditions, so this passive
// Does not repeat it
export const createByakuyaKougetsuPassiveModule = (params: number[]): WeaponPassiveModule => {
  const maxHealthShare = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const energy = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  return {
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (strike.attackTag !== AttackTag.NormalAttack) return 0;
      return (
        maxHealthShare *
        getBuffedCombatant(strike.combatant, effects, party, characterIdCombatantMap).attributes.attributeTotalMap[
          Attribute.Health
        ]
      );
    },
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.BurstUsed) {
        if (event.characterId !== characterId) return;
        addKitStatus(kitEffectState, characterId, { id: BYAKUYA_KOUGETSU_ID, secondsRemaining: seconds });
        return;
      }
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        event.attackTag !== AttackTag.NormalAttack ||
        !checkIsKitStatusActive(kitEffectState.effects, characterId, BYAKUYA_KOUGETSU_ID) ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, BYAKUYA_KOUGETSU_COOLDOWN_ID)
      )
        return;
      addKitStatus(kitEffectState, characterId, {
        id: BYAKUYA_KOUGETSU_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      gainPartyMemberEnergy(party, combatant, energy);
    },
  };
};
