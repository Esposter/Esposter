import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { takeOne } from "@esposter/shared";

const EAGLE_SPEAR_ID = "eagleSpear";
const EAGLE_SPEAR_COOLDOWN_SECONDS = 0.3;
const EAGLE_SPEAR_MAXIMUM_STACKS = 7;
const EAGLE_SPEAR_SECONDS = 6;

// Eagle Spear of Justice at its rank: each hit its wielder deals raises its ATK by the rank's percentage per stack, up to seven
// Stacks, which last six seconds from the last gained, a stack at most once every 0.3 seconds. While the wielder holds the
// Maximum, its DMG dealt is raised by the rank's second number, a buff the stacks carry. Provisional: every hit counts, a
// Passive's own queued hit too, since the text says only "on hit"
export const createEagleSpearOfJusticePassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercentage = takeOne(params, 0);
  const maximumDamageBonus = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      addPassiveStack(context.kitEffectState, combatant.characterId, {
        cooldownSeconds: EAGLE_SPEAR_COOLDOWN_SECONDS,
        id: EAGLE_SPEAR_ID,
        maximumBonuses: [{ amount: maximumDamageBonus, attribute: Attribute.AllDamageBonus }],
        maximumStacks: EAGLE_SPEAR_MAXIMUM_STACKS,
        perStackBonuses: [{ amount: attackPercentage, attribute: Attribute.AttackPercent }],
        seconds: EAGLE_SPEAR_SECONDS,
      });
    },
  };
};
