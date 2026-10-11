import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { takeOne } from "@esposter/shared";

// Instructor's four-piece bonus, its seconds and its Elemental Mastery in the set table's order: a reaction its wearer
// Triggers on the field gives every member of the deployed team that Elemental Mastery for those seconds. A reaction its
// Summon triggers once it has left the field gives none, and a second one restarts the buff rather than stacking it
export const createInstructorSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const seconds = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  return {
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        event.striker.characterId !== combatant.characterId ||
        activeCombatant.characterId !== combatant.characterId
      )
        return;
      for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
        addKitEffect(kitEffectState, {
          amount: elementalMastery,
          attribute: Attribute.ElementalMastery,
          characterId,
          kind: "buff",
          secondsRemaining: seconds,
          source: "Instructor",
        });
    },
  };
};
