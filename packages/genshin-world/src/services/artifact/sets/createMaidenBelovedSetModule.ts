import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { ElementalAction } from "#src/models/artifact/ElementalAction";
import { Attribute } from "#src/models/character/Attribute";
import { createUsedActionTeamBuffSetModule } from "#src/services/artifact/sets/createUsedActionTeamBuffSetModule";
import { takeOne } from "@esposter/shared";

// Maiden Beloved's four-piece bonus: the healing received every deployed member gains for the seconds in the
// Table's second param, after its wearer uses its Elemental Skill or Burst, at the amount in the first
export const createMaidenBelovedSetModule = ({ params }: ArtifactSetBonus): PassiveModule =>
  createUsedActionTeamBuffSetModule({
    actions: [ElementalAction.Skill, ElementalAction.Burst],
    amount: takeOne(params, 0),
    attribute: Attribute.IncomingHealingBonus,
    seconds: takeOne(params, 1),
    source: "Maiden Beloved",
  });
