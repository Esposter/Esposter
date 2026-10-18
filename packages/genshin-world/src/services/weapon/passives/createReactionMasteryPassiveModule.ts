import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { takeOne } from "@esposter/shared";

// A passive that, after its wielder causes an Elemental Reaction, whether or not the wielder is on the field, raises its
// Elemental Mastery by the rank's amount for the rank's seconds, and by the rank's Moonsign amount more while the deployed
// Team is Ascendant Gleam
export const createReactionMasteryPassiveModule = (
  params: number[],
  { source }: { source: string },
): WeaponPassiveModule => {
  const elementalMastery = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const ascendantGleamElementalMastery = takeOne(params, 2);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      const isAscendantGleam =
        getMoonsignLevel(context.characterIdCombatantMap, context.party) === MoonsignLevel.AscendantGleam;
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: isAscendantGleam ? elementalMastery + ascendantGleamElementalMastery : elementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source,
      });
    },
  };
};
