import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const RADIANCE_ID = "radianceOfTheDeeps";
const RADIANCE_COOLDOWN_ID = "radianceOfTheDeepsCooldown";
// Evengleam, Afterglow and Dawnblaze, the three states the text names
const RADIANCE_STATE_COUNT = 3;

// Radiance of the Deeps at its rank: its three states, Evengleam, Afterglow and Dawnblaze, each raise the DMG the
// Wielder deals by The rank's amount in turn. A hit of hers that strikes an enemy moves the state on, once every
// Cooldown, whether or not she is on The field. The state is held as the status's count, and it starts at Evengleam
export const createRadianceOfTheDeepsPassiveModule = (params: number[]): PassiveModule => {
  const cooldownSeconds = takeOne(params, 0);
  const damageBonuses = [takeOne(params, 1), takeOne(params, 2), takeOne(params, 3)];
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const state = findKitStatus(effects, characterId, RADIANCE_ID)?.stacks ?? 0;
      return [{ amount: takeOne(damageBonuses, state), attribute: Attribute.AllDamageBonus }];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        !startKitCooldown(kitEffectState, characterId, RADIANCE_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      const state = findKitStatus(kitEffectState.effects, characterId, RADIANCE_ID)?.stacks ?? 0;
      addKitStatus(kitEffectState, characterId, {
        id: RADIANCE_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: (state + 1) % RADIANCE_STATE_COUNT,
      });
    },
  };
};
