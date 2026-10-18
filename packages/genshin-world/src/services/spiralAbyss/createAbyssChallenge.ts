import type { PartyTeam } from "#src/models/party/PartyTeam";
import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { ABYSS_MONOLITH_FULL_PERCENT } from "#src/services/spiralAbyss/constants";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";

// A chamber about to be fought by its party set, one team with a character in it for each half: none of its halves defeated,
// Its clock at the full seconds of its floor, and its monolith at full health when one of its conditions reads one. The clock
// Is one for both halves, so the second half starts with what the first left. A chamber is not entered without that party
// Set, so a set that is not one team per half, holds a team with no character or holds one character twice has no challenge
export const createAbyssChallenge = (
  floor: AbyssFloor,
  chamber: AbyssChamber,
  teams: readonly PartyTeam[],
): AbyssChallenge | undefined => {
  const characterIds = teams.flatMap((team) => team.characterIds);
  if (
    teams.length !== floor.teamCount ||
    teams.some((team) => team.characterIds.length === 0) ||
    new Set(characterIds).size !== characterIds.length
  )
    return undefined;
  const hasMonolith = chamber.conditions.some(({ kind }) => kind === AbyssStarConditionKind.MonolithHealth);
  return {
    defeatedHalfCount: 0,
    halfCount: floor.teamCount,
    monolithPercent: hasMonolith ? ABYSS_MONOLITH_FULL_PERCENT : undefined,
    secondsLeft: getAbyssChamberSeconds(floor.index),
  };
};
