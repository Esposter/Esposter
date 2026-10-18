import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { createUsedActionTeamBuffSetModule } from "#src/services/artifact/sets/createUsedActionTeamBuffSetModule";
import { takeOne } from "@esposter/shared";

// Noblesse Oblige. Its two-piece bonus, Elemental Burst DMG, waits on a burst damage attribute the pricing does not
// Hold yet, so it prices nothing. Its four-piece bonus gives every deployed member the ATK in the table's first param for
// The seconds in its second, after its wearer uses its Elemental Burst, and a use restarts it rather than stacking it
export const createNoblesseObligeSetModule = (bonus: ArtifactSetBonus): ArtifactSetModule => {
  if (bonus.pieceCount === 2) return {};
  const { params } = bonus;
  return createUsedActionTeamBuffSetModule({
    actions: ["burst"],
    amount: takeOne(params, 0),
    attribute: Attribute.AttackPercent,
    seconds: takeOne(params, 1),
    source: "Noblesse Oblige",
  });
};
