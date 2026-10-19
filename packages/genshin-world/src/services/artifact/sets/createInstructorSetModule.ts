import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { takeOne } from "@esposter/shared";

// Instructor's four-piece bonus, its seconds and its Elemental Mastery in the set table's order: a reaction its wearer
// Triggers on the field gives every member of the deployed team that Elemental Mastery for those seconds. A reaction its
// Summon triggers once it has left the field gives none, and a second one restarts the buff rather than stacking it
export const createInstructorSetModule = ({ params }: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  return {
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      if (!checkIsOwnReactionTriggered(event, combatant) || activeCombatant.characterId !== combatant.characterId)
        return;
      buffKitTeam(kitEffectState, party, {
        amount: elementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source: "Instructor",
      });
    },
  };
};
