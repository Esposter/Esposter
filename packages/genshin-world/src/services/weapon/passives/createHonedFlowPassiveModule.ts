import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const WAVESPIKE_ID = "wavespike";
const WAVESPIKE_COOLDOWN_ID = "wavespikeCooldown";
const RIPPLING_UPHEAVAL_SOURCE = "honedFlow";

// Honed Flow at its rank: the wielder gets the rank's Elemental DMG Bonus for every element. Each Elemental Skill another
// Member uses adds a Wavespike stack, up to the rank's maximum and once every cooldown, and the stacks wait without running
// Out. The wielder's Elemental Skill consumes them all for Rippling Upheaval, which raises Normal Attack DMG by the rank's
// Amount per stack consumed for the rank's seconds. A second Rippling Upheaval restarts the first at its own stacks
export const createHonedFlowPassiveModule = (params: number[]): WeaponPassiveModule => {
  const elementalDamageBonus = takeOne(params, 0);
  const maximumStacks = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  const attackDamagePerStack = takeOne(params, 3);
  const upheavalSeconds = takeOne(params, 4);
  return {
    getPassiveBonuses: () =>
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: elementalDamageBonus, attribute })),
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed) return;
      const { characterId } = combatant;
      if (event.characterId !== characterId) {
        if (checkIsKitStatusActive(kitEffectState.effects, characterId, WAVESPIKE_COOLDOWN_ID)) return;
        addKitStatus(kitEffectState, characterId, { id: WAVESPIKE_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
        addKitHold(kitEffectState, characterId, { id: WAVESPIKE_ID, maximum: maximumStacks, seconds: Infinity });
        return;
      }
      const consumedStacks = releaseKitHolds(kitEffectState, characterId, WAVESPIKE_ID);
      if (consumedStacks === 0) return;
      buffKitMember(kitEffectState, characterId, {
        amount: attackDamagePerStack * consumedStacks,
        attribute: Attribute.NormalAttackDamageBonus,
        secondsRemaining: upheavalSeconds,
        source: RIPPLING_UPHEAVAL_SOURCE,
      });
    },
  };
};
