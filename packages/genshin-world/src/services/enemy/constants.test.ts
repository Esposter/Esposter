import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { describe } from "vitest";

// The camp member every AI suite spawns: the provisional kind at the first level, standing at the origin
export const ENEMY_CAMP_MEMBER = {
  enemyKindId: EnemyKindId.HilichurlFighter,
  id: "",
  level: 1,
  patrol: [],
  position: { x: 0, z: 0 },
} satisfies EnemyCampMember;

describe.todo("constants");
