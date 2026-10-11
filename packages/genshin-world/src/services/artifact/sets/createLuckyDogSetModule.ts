import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { takeOne } from "@esposter/shared";

// Lucky Dog's four-piece bonus, the HP in the set table's row: Mora its wearer picks up on the field restores that much HP
// To it, as the table's `Relic_CoinHealSelf` names it
export const createLuckyDogSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const healedHealth = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.MoraPickedUp && event.characterId === combatant.characterId)
        changeKitMemberHealth(context, combatant, combatant.characterId, healedHealth);
    },
  };
};
