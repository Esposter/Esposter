import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { createUsedActionTeamBuffSetModule } from "#src/services/artifact/sets/createUsedActionTeamBuffSetModule";
import { takeOne } from "@esposter/shared";

// Maiden Beloved's four-piece bonus: the healing received every deployed member gains for the seconds in the
// Table's second param, after its wearer uses its Elemental Skill or Burst, at the amount in the first
export const createMaidenBelovedSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule =>
  createUsedActionTeamBuffSetModule({
    actions: ["skill", "burst"],
    amount: takeOne(params, 0),
    attribute: Attribute.IncomingHealingBonus,
    seconds: takeOne(params, 1),
    source: "Maiden Beloved",
  });
