import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { takeOne } from "@esposter/shared";

const INFUSION_STINGER_COOLDOWN_SECONDS = 1;

// Infusion Stinger at its rank: each elemental hit its wielder deals adds an All DMG Bonus stack, up to the rank's maximum
// Stacks for the rank's seconds, once every second
export const createInfusionStingerPassiveModule = (params: number[]): WeaponPassiveModule => {
  const allDamageBonus = takeOne(params, 0);
  const maximumStacks = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.element === undefined ||
        event.striker.characterId !== combatant.characterId
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        cooldownSeconds: INFUSION_STINGER_COOLDOWN_SECONDS,
        id: "infusionStinger",
        maximumStacks,
        perStackBonuses: [{ amount: allDamageBonus, attribute: Attribute.AllDamageBonus }],
        seconds,
      });
    },
  };
};
