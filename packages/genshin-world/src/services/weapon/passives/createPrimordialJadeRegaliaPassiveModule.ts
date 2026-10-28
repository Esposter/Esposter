import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

const PRIMORDIAL_JADE_REGALIA_SOURCE = "primordialJadeRegalia";
const PRIMORDIAL_JADE_REGALIA_ENERGY_TASK_ID = "primordialJadeRegaliaEnergy";
// The frames after a trigger its energy is restored at, as gcsim queues it to give Baizhu 6 ticks as the game does
const PRIMORDIAL_JADE_REGALIA_ENERGY_FRAMES = 142;

// Primordial Jade Regalia at its rank: its wielder's burst, or a shield it casts, gives it its element's DMG Bonus by
// Each 1,000 Max HP it has up to a cap for the seconds given, and restores its energy once 142 frames after, a later
// Trigger restarting that wait, as gcsim's jadefallssplendor.go does (OnBurst and OnShielded by the shield's owner, the
// Energy a task its later trigger's src cancels). The restoring interval its table gives is not read, as gcsim restores
// The energy once
export const createPrimordialJadeRegaliaPassiveModule = (params: number[]): PassiveModule => {
  const damageBonusPerThousandMaxHealth = takeOne(params, 0);
  const damageBonusCap = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const energy = takeOne(params, 4);
  return {
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      const { characterId, element } = combatant;
      if (
        !(event.kind === KitEventKind.BurstUsed && event.characterId === characterId) &&
        !(event.kind === KitEventKind.ShieldCast && event.shield.characterId === characterId)
      )
        return;
      if (element !== undefined) {
        const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
        buffKitMember(kitEffectState, characterId, {
          amount: Math.min((maxHealth / 1000) * damageBonusPerThousandMaxHealth, damageBonusCap),
          attribute: ElementDamageBonusAttributeMap[element],
          secondsRemaining: seconds,
          source: PRIMORDIAL_JADE_REGALIA_SOURCE,
        });
      }
      scheduleKitTask(
        kitEffectState,
        characterId,
        toKitSeconds(PRIMORDIAL_JADE_REGALIA_ENERGY_FRAMES),
        (tick) => {
          gainPartyMemberEnergy(tick.party, combatant, energy);
        },
        { id: PRIMORDIAL_JADE_REGALIA_ENERGY_TASK_ID },
      );
    },
  };
};
