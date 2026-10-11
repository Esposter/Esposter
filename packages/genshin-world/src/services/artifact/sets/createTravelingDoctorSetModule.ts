import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { takeOne } from "@esposter/shared";

// Traveling Doctor's four-piece bonus, the share of its wearer's Max HP in the set table's row: a burst its wearer uses
// Restores that share of its Max HP to it as the burst starts, raised by the Healing Bonuses as every heal is
export const createTravelingDoctorSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const healedHealthShare = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.BurstUsed && event.characterId === combatant.characterId)
        changeKitMemberHealth(
          context,
          combatant,
          combatant.characterId,
          healedHealthShare * combatant.attributes.maxHealth,
        );
    },
  };
};
