import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { takeOne } from "@esposter/shared";

const MAGIC_AFFINITY_MAXIMUM_STACKS = 2;
const MAGIC_AFFINITY_SECONDS = 12;

// Magic Affinity at its rank: after its wielder uses an elemental skill, its normal and charged attacks deal the rank's DMG
// More per stack, up to two stacks for twelve seconds
export const createMagicAffinityPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== combatant.characterId) return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: "magicAffinity",
        maximumStacks: MAGIC_AFFINITY_MAXIMUM_STACKS,
        perStackBonuses: [
          { amount: damageBonus, attribute: Attribute.NormalAttackDamageBonus },
          { amount: damageBonus, attribute: Attribute.ChargedAttackDamageBonus },
        ],
        seconds: MAGIC_AFFINITY_SECONDS,
      });
    },
  };
};
