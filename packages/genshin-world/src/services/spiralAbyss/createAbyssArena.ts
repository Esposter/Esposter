import type { PartyTeam } from "#src/models/party/PartyTeam";
import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { GroundPoint } from "genshin-engine";

import { createAbyssChallenge } from "#src/services/spiralAbyss/createAbyssChallenge";
import { createAbyssHalfCamp } from "#src/services/spiralAbyss/createAbyssHalfCamp";
import { getAbyssCampId } from "#src/services/spiralAbyss/getAbyssCampId";

// A chamber entered in the arena on a party set: its challenge, and its first half's camp spawned beside the entrance. A
// Party set the challenge refuses, or a chamber a half of which lists no enemies yet, is not entered
export const createAbyssArena = (
  floor: AbyssFloor,
  chamber: AbyssChamber,
  teams: readonly PartyTeam[],
  enemyKindIds: Readonly<Record<string, number>>,
  areaId: string,
  center: GroundPoint,
  startedAt: number,
): AbyssArena | undefined => {
  const challenge = createAbyssChallenge(floor, chamber, teams);
  if (challenge === undefined) return undefined;
  const halfMonsterDescribeIds = chamber.halfMonsterDescribeIds.slice(0, challenge.halfCount);
  if (
    halfMonsterDescribeIds.length < challenge.halfCount ||
    halfMonsterDescribeIds.some((describeIds) => describeIds.length === 0)
  )
    return undefined;
  return {
    areaId,
    camp: createAbyssHalfCamp(
      areaId,
      getAbyssCampId(startedAt, 0),
      center,
      halfMonsterDescribeIds[0] ?? [],
      enemyKindIds,
      chamber.monsterLevel,
    ),
    center,
    challenge,
    chamber,
    defeatsInHalf: 0,
    enemyKindIds,
    floor,
    startedAt,
  };
};
