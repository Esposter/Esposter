import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const ASTRAL_WHISPERS_SOURCE = "astralWhispers";

// Astral Whispers Beyond the Sacred Throne at its rank: a hit its wielder deals while the wielder is off the field raises its
// ATK by the rank's percentage for the rank's seconds. The field is read as the character the context holds on it
export const createAstralWhispersPassiveModule = (params: number[]): PassiveModule => {
  const seconds = takeOne(params, 0);
  const attackPercentage = takeOne(params, 1);
  return {
    onKitEvent: (event, { activeCombatant, kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        activeCombatant.characterId === combatant.characterId
      )
        return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: attackPercentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: ASTRAL_WHISPERS_SOURCE,
      });
    },
  };
};
