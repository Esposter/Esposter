import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { takeOne } from "@esposter/shared";

const INFUSION_SCROLL_STATUS_ID = "infusionScroll";
// The seven elements' DMG Bonus attributes, each raised by the stacks alike, as the passive's Elemental DMG Bonus is
const ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES: readonly Attribute[] = [
  Attribute.AnemoDamageBonus,
  Attribute.CryoDamageBonus,
  Attribute.DendroDamageBonus,
  Attribute.ElectroDamageBonus,
  Attribute.GeoDamageBonus,
  Attribute.HydroDamageBonus,
  Attribute.PyroDamageBonus,
];
// Provisional readings from the passive's text, which its numbers do not carry: two stacks at most, each lasting ten seconds
// From the reaction that adds it, a stack restarting every stack's seconds with it
const INFUSION_SCROLL_MAXIMUM_STACKS = 2;
const INFUSION_SCROLL_SECONDS = 10;

// Infusion Scroll's Elemental DMG Bonus at its rank, which each reaction its wielder triggers adds a stack of, up to two,
// Given to its wielder on every element
export const createInfusionScrollPassiveModule = (params: number[]): WeaponPassiveModule => {
  const bonusPerStack = takeOne(params, 0);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      const { characterId } = combatant;
      const held = findKitStatus(kitEffectState.effects, characterId, INFUSION_SCROLL_STATUS_ID)?.stacks ?? 0;
      const stacks = Math.min(held + 1, INFUSION_SCROLL_MAXIMUM_STACKS);
      addKitStatus(kitEffectState, characterId, {
        id: INFUSION_SCROLL_STATUS_ID,
        secondsRemaining: INFUSION_SCROLL_SECONDS,
        stacks,
      });
      for (const attribute of ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES)
        buffKitMember(kitEffectState, characterId, {
          amount: stacks * bonusPerStack,
          attribute,
          secondsRemaining: INFUSION_SCROLL_SECONDS,
          source: INFUSION_SCROLL_STATUS_ID,
        });
    },
  };
};
