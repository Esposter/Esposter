import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// Berserker's four-piece bonus, its CRIT Rate and the share of its wearer's Max HP in the set table's order: its wearer's
// Hits are priced with that CRIT Rate while its HP is below that share
export const createBerserkerSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const criticalRate = takeOne(params, 0);
  const maxHealthShare = takeOne(params, 1);
  return {
    getPassiveBonuses: (_combatant, memberState) =>
      memberState.healthShare < maxHealthShare ? [{ amount: criticalRate, attribute: Attribute.CriticalRate }] : [],
  };
};
