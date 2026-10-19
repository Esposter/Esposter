import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const INFUSION_SCROLL_STATUS_ID = "infusionScroll";
// Provisional readings from the passive's text, which its numbers do not carry: two stacks at most, each lasting ten seconds
// From the reaction that adds it, a stack restarting every stack's seconds with it
const INFUSION_SCROLL_MAXIMUM_STACKS = 2;
const INFUSION_SCROLL_SECONDS = 10;

// Infusion Scroll's Elemental DMG Bonus at its rank, which each reaction its wielder triggers adds a stack of, up to two,
// Given to its wielder on every element
export const createInfusionScrollPassiveModule = (params: number[]): PassiveModule => {
  const bonusPerStack = takeOne(params, 0);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: INFUSION_SCROLL_STATUS_ID,
        maximumStacks: INFUSION_SCROLL_MAXIMUM_STACKS,
        perStackBonuses: ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: bonusPerStack, attribute })),
        seconds: INFUSION_SCROLL_SECONDS,
      });
    },
  };
};
