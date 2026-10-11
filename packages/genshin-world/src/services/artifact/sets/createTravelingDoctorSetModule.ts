import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { takeOne } from "@esposter/shared";

// Traveling Doctor's four-piece bonus, the share of its wearer's Max HP in the set table's row: a burst its wearer uses
// Restores that share of its HP to it as the burst starts. Its Incoming Healing Bonus is not read, as no heal reads it
export const createTravelingDoctorSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const healedHealthShare = takeOne(params, 0);
  return {
    onKitEvent: (event, { party }, combatant) => {
      if (event.kind === KitEventKind.BurstUsed && event.characterId === combatant.characterId)
        healPartyMember(party, combatant.characterId, healedHealthShare);
    },
  };
};
