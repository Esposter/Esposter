import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const WIND_UNATTAINED_SOURCE = "windUnattained";

// The Wind Unattained at its rank: an Elemental Reaction triggered raises the wielder's ATK by the rank's percentage
// And its Elemental Mastery by the rank's amount, each for the rank's seconds. Every reaction counts, the wielder's or
// A member's
export const createWindUnattainedPassiveModule = (params: number[]): PassiveModule => {
  const attackPercentage = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: attackPercentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: WIND_UNATTAINED_SOURCE,
      });
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: elementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source: WIND_UNATTAINED_SOURCE,
      });
    },
  };
};
