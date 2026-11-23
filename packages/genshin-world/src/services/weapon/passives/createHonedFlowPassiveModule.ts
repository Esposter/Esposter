import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const WAVESPIKE_ID = "wavespike";
const WAVESPIKE_COOLDOWN_ID = "wavespikeCooldown";
const RIPPLING_UPHEAVAL_ID = "ripplingUpheaval";

// Honed Flow at its rank: its All Elemental DMG Bonus is a passive bonus on each element. Each Elemental Skill another
// Member Uses adds a stack of Wavespike, up to the rank's count, once every cooldown. The wielder's Elemental Skill
// Consumes them All, each raising its Normal Attack DMG by the rank's amount for the rank's seconds, as Rippling
// Upheaval
export const createHonedFlowPassiveModule = (params: number[]): PassiveModule => {
  const elementalDamageBonus = takeOne(params, 0);
  const maximumStacks = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  const normalAttackDamageBonus = takeOne(params, 3);
  const upheavalSeconds = takeOne(params, 4);
  return {
    getPassiveBonuses: () =>
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: elementalDamageBonus, attribute })),
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.SkillUsed) return;
      const stacks = findKitStatus(kitEffectState.effects, characterId, WAVESPIKE_ID)?.stacks ?? 0;
      if (event.characterId !== characterId) {
        if (
          stacks >= maximumStacks ||
          !startKitCooldown(kitEffectState, characterId, WAVESPIKE_COOLDOWN_ID, cooldownSeconds)
        )
          return;
        addKitStatus(kitEffectState, characterId, {
          id: WAVESPIKE_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
          stacks: stacks + 1,
        });
        return;
      }
      if (stacks === 0) return;
      removeKitEffects(
        kitEffectState,
        (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === WAVESPIKE_ID,
      );
      buffKitMember(kitEffectState, characterId, {
        amount: stacks * normalAttackDamageBonus,
        attribute: Attribute.NormalAttackDamageBonus,
        secondsRemaining: upheavalSeconds,
        source: RIPPLING_UPHEAVAL_ID,
      });
    },
  };
};
