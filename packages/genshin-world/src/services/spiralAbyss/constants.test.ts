import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { describe } from "vitest";

// The arena the Abyss suites enter: one chamber of two halves, each a camp of one enemy, fought by two teams
export const AREA_ID = "area";
export const CENTER = { x: 0, z: 0 };
export const DESCRIBE_ID = 10101;
export const ENEMY_KIND_IDS = { [DESCRIBE_ID]: EnemyKindId.HilichurlFighter };
export const MONSTER_LEVEL = 24;
export const STARTED_AT = 0;
export const CHAMBER: AbyssChamber = {
  conditions: [],
  halfMonsterDescribeIds: [[DESCRIBE_ID], [DESCRIBE_ID]],
  id: 1,
  index: 1,
  monsterLevel: MONSTER_LEVEL,
};
export const FLOOR: AbyssFloor = { chambers: [CHAMBER], id: 1001, index: 1, teamCount: 2, unlockStarCount: 0 };
export const TEAMS = [
  { characterIds: [1], name: "a" },
  { characterIds: [2], name: "b" },
];

describe.todo("constants");
