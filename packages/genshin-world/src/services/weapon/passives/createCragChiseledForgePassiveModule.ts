import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getFreeStackSource } from "#src/services/weapon/passives/getFreeStackSource";
import { takeOne } from "@esposter/shared";

const CRAG_CHISELED_FORGE_MAXIMUM_STACKS = 2;
const CRAG_CHISELED_FORGE_SOURCE = "cragChiseledForge";

// Crag-Chiseled Forge at its rank: each Elemental Burst its wielder uses, which spends its Energy, raises its Elemental
// Mastery by the rank's amount for the rank's seconds, up to two stacks. Each stack runs on its own timer, as Press the
// Advantage's do, and a burst at the cap adds none. The Energy decrease is read as the wielder's own burst, the spend
// Its kit event carries
export const createCragChiseledForgePassiveModule = (params: number[]): PassiveModule => {
  const elementalMastery = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.BurstUsed || event.characterId !== combatant.characterId) return;
      const { characterId } = combatant;
      const source = getFreeStackSource(
        context.kitEffectState.effects,
        characterId,
        CRAG_CHISELED_FORGE_SOURCE,
        CRAG_CHISELED_FORGE_MAXIMUM_STACKS,
      );
      if (source === undefined) return;
      buffKitMember(context.kitEffectState, characterId, {
        amount: elementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source,
      });
    },
  };
};
