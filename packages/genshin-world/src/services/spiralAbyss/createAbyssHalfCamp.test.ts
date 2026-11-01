import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { DOMAIN_ARENA_SPREAD } from "#src/services/domains/constants";
import { AREA_ID, CENTER, DESCRIBE_ID, ENEMY_KIND_IDS, MONSTER_LEVEL } from "#src/services/spiralAbyss/constants.test";
import { createAbyssHalfCamp } from "#src/services/spiralAbyss/createAbyssHalfCamp";
import { describe, expect, test } from "vitest";

describe(createAbyssHalfCamp, () => {
  const CAMP_ID = "camp";

  test("a half's monsters stand in one camp, each as its describe's kind at the chamber's monster level", () => {
    expect.hasAssertions();

    expect(createAbyssHalfCamp(AREA_ID, CAMP_ID, CENTER, [DESCRIBE_ID], ENEMY_KIND_IDS, MONSTER_LEVEL)).toStrictEqual({
      areaId: AREA_ID,
      id: CAMP_ID,
      members: [
        {
          enemyKindId: EnemyKindId.HilichurlFighter,
          id: "0",
          level: MONSTER_LEVEL,
          patrol: [],
          position: { x: DOMAIN_ARENA_SPREAD, z: 0 },
        },
      ],
    });
  });

  test("a describe with no kind is refused", () => {
    expect.hasAssertions();

    expect(() =>
      createAbyssHalfCamp(AREA_ID, CAMP_ID, CENTER, [DESCRIBE_ID], {}, MONSTER_LEVEL),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 10101, has no enemy kind]`,
    );
  });
});
