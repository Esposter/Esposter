import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { takeOne } from "@esposter/shared";

const DEATHLY_PACT_ID = "deathlyPact";
const DEATHLY_PACT_MAXIMUM_STACKS = 3;

// Deathly Pact at its rank: each increase of the wielder's Bond of Life adds a stack of the rank's DMG bonus, up to three, each
// Stack running the rank's seconds. The rank's CRIT DMG line is a table line the weapon carries whatever its conditions,
// So this passive does not repeat it
export const createDeathlyPactPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonusPerStack = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.bondOfLifeShare <= 0
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: DEATHLY_PACT_ID,
        maximumStacks: DEATHLY_PACT_MAXIMUM_STACKS,
        perStackBonuses: [{ amount: damageBonusPerStack, attribute: Attribute.AllDamageBonus }],
        seconds,
      });
    },
  };
};
