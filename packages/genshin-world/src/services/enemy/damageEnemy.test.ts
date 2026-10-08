import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { describe, expect, test } from "vitest";

describe(damageEnemy, () => {
  const { energyDrops, poiseType } = EnemyKindTraitsMap[ENEMY_CAMP_MEMBER.enemyKindId];
  const { endurance, length, resetSeconds } = PoiseTypeSettingsMap[poiseType];

  test("drops the energy of a threshold it falls past once, however often it is hit after", () => {
    expect.hasAssertions();

    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    const firstEnergy = damageEnemy(enemy, { damage: enemy.maxHealth / 2, poiseDamage: 0 });
    const secondEnergy = damageEnemy(enemy, { damage: 0, poiseDamage: 0 });

    expect(firstEnergy).toStrictEqual(energyDrops.slice(0, 1));
    expect(secondEnergy).toStrictEqual([]);
  });

  test("a defeating hit drops every threshold left and kills", () => {
    expect.hasAssertions();

    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    const energy = damageEnemy(enemy, { damage: enemy.maxHealth, poiseDamage: 0 });

    expect(energy).toStrictEqual(energyDrops);
    expect(enemy).toStrictEqual({
      ...createEnemy(ENEMY_CAMP_MEMBER, ""),
      droppedThresholdCount: energyDrops.length,
      health: 0,
      state: EnemyState.Dead,
    });
  });

  test("a hit that breaks its poise staggers it until the reset", () => {
    expect.hasAssertions();

    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    setEnemyState(enemy, EnemyState.Windup);
    damageEnemy(enemy, { damage: 0, poiseDamage: length / endurance });

    expect(enemy).toStrictEqual({
      ...createEnemy(ENEMY_CAMP_MEMBER, ""),
      poise: 0,
      poiseBrokenSeconds: resetSeconds,
      state: EnemyState.Stagger,
    });
  });

  test("a hit sets an idle enemy on its attacker", () => {
    expect.hasAssertions();

    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    damageEnemy(enemy, { damage: 0, poiseDamage: 0 });

    expect(enemy.state).toBe(EnemyState.Chase);
  });

  test("a returning enemy is immune", () => {
    expect.hasAssertions();

    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    setEnemyState(enemy, EnemyState.Return);

    expect(damageEnemy(enemy, { damage: enemy.maxHealth, poiseDamage: 0 })).toStrictEqual([]);
    expect(enemy.health).toBe(enemy.maxHealth);
  });
});
