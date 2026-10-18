import { EnemyType } from "#src/models/enemy/EnemyType";
import { displaceEnemy } from "#src/services/enemy/displaceEnemy";
import { describe, expect, test } from "vitest";

describe(displaceEnemy, () => {
  const position = { x: 1, z: 2 };
  const push = { x: 0.5, z: -1 };

  test("a boss is not displaced by a strike that would push it", () => {
    expect.hasAssertions();

    expect(displaceEnemy(EnemyType.Boss, position, push)).toStrictEqual(position);
  });

  test("a common enemy is displaced by the same strike", () => {
    expect.hasAssertions();

    expect(displaceEnemy(EnemyType.Common, position, push)).toStrictEqual({ x: 1.5, z: 1 });
  });
});
