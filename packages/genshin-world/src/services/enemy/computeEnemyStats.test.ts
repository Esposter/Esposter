import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { describe, expect, test } from "vitest";

describe(computeEnemyStats, () => {
  const enemyKind = getEnemyKind(EnemyKindId.HilichurlFighter);

  test("scales each base stat by its curve at the level", () => {
    expect.hasAssertions();

    expect(computeEnemyStats(enemyKind, 2)).toStrictEqual({
      attack: 22.608 * 2.32577,
      defense: 500 * 1.02,
      maxHealth: 13.584 * 6.818905,
    });
  });

  test("throws for a level its curves do not reach", () => {
    expect.hasAssertions();

    expect(() => computeEnemyStats(enemyKind, 0)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: GROW_CURVE_ATTACK, has no multiplier at level 0]`,
    );
  });
});
