import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import type { Attribute } from "#src/models/character/Attribute";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsStellarGlimmerReaction } from "#src/services/kit/checkIsStellarGlimmerReaction";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// A passive that, after its wielder triggers a Stellar Glimmer reaction whether or not the wielder is on the field, raises
// One of its Attributes by the rank's amount for the rank's seconds
export const createStellarGlimmerBuffPassiveModule = (
  params: number[],
  { attribute, source }: { attribute: Attribute; source: string },
): WeaponPassiveModule => {
  const amount = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        event.striker.characterId !== combatant.characterId ||
        !event.reactions.some(checkIsStellarGlimmerReaction)
      )
        return;
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount,
        attribute,
        secondsRemaining: seconds,
        source,
      });
    },
  };
};
