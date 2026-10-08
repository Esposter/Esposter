import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { describe, expect, test } from "vitest";

describe(damageEnemy, () => {
  const member: EnemyCampMember = {
    enemyKindId: EnemyKindId.HilichurlFighter,
    id: "",
    level: 1,
    patrol: [],
    position: { x: 0, z: 0 },
  };
  const { energyDrops, poiseType } = EnemyKindTraitsMap[member.enemyKindId];
  const { endurance, length, resetSeconds } = PoiseTypeSettingsMap[poiseType];

  test("drops the energy of a threshold it falls past once, however often it is hit after", () => {
    expect.hasAssertions();

    const enemy = createEnemy(member, "");
    const firstEnergy = damageEnemy(enemy, { damage: enemy.maxHealth / 2, poiseDamage: 0 });
    const secondEnergy = damageEnemy(enemy, { damage: 0, poiseDamage: 0 });

    expect(firstEnergy).toStrictEqual(energyDrops.slice(0, 1));
    expect(secondEnergy).toStrictEqual([]);
  });

  test("a defeating hit drops every threshold left and kills", () => {
    expect.hasAssertions();

    const enemy = createEnemy(member, "");
    const energy = damageEnemy(enemy, { damage: enemy.maxHealth, poiseDamage: 0 });

    expect(energy).toStrictEqual(energyDrops);
    expect(enemy).toStrictEqual({
      ...createEnemy(member, ""),
      droppedThresholdCount: energyDrops.length,
      health: 0,
      state: EnemyState.Dead,
    });
  });

  test("a hit that breaks its poise staggers it until the reset", () => {
    expect.hasAssertions();

    const enemy = createEnemy(member, "");
    setEnemyState(enemy, EnemyState.Windup);
    damageEnemy(enemy, { damage: 0, poiseDamage: length / endurance });

    expect(enemy).toStrictEqual({
      ...createEnemy(member, ""),
      poise: 0,
      poiseBrokenSeconds: resetSeconds,
      state: EnemyState.Stagger,
    });
  });

  test("a hit sets an idle enemy on its attacker", () => {
    expect.hasAssertions();

    const enemy = createEnemy(member, "");
    damageEnemy(enemy, { damage: 0, poiseDamage: 0 });

    expect(enemy.state).toBe(EnemyState.Chase);
  });

  test("a returning enemy is immune", () => {
    expect.hasAssertions();

    const enemy = createEnemy(member, "");
    setEnemyState(enemy, EnemyState.Return);

    expect(damageEnemy(enemy, { damage: enemy.maxHealth, poiseDamage: 0 })).toStrictEqual([]);
    expect(enemy.health).toBe(enemy.maxHealth);
  });
});
