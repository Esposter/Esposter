import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyEvent } from "#src/models/enemy/EnemyEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import {
  ENEMY_AGGRO_RANGE,
  ENEMY_ALERT_SECONDS,
  ENEMY_ATTACK_COOLDOWN_SECONDS,
  ENEMY_ATTACK_RANGE,
  ENEMY_ATTACK_REACH,
  ENEMY_DEATH_SECONDS,
  ENEMY_LEASH_DISTANCE,
  ENEMY_RECOVERY_SECONDS,
  ENEMY_RUN_SPEED,
  ENEMY_STEP_SECONDS,
  ENEMY_WALK_SPEED,
  ENEMY_WINDUP_SECONDS,
} from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(stepEnemy, () => {
  test("an idle enemy notices a target within its aggro range and turns to it", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const enemyEvent = stepEnemy(enemy, { x: ENEMY_AGGRO_RANGE, z: 0 }, ENEMY_STEP_SECONDS);

    expect(enemyEvent).toBeUndefined();
    expect(enemy).toStrictEqual({
      ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      heading: Math.PI / 2,
      state: EnemyState.Alert,
    });
  });

  test("an idle enemy walks its patrol from point to point", () => {
    expect.hasAssertions();

    const patrol = [{ x: ENEMY_WALK_SPEED, z: 0 }, ENEMY_CAMP_MEMBER.position];
    const enemy = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, patrol }, "");
    stepEnemy(enemy, undefined, 1);

    expect(enemy).toStrictEqual({
      ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, patrol }, ""),
      heading: Math.PI / 2,
      patrolIndex: 1,
      position: { x: ENEMY_WALK_SPEED, z: 0 },
      stateSeconds: 1,
    });
  });

  test("an alert enemy gives chase once its alert passes", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    setEnemyState(enemy, EnemyState.Alert);
    stepEnemy(enemy, { x: 0, z: ENEMY_AGGRO_RANGE }, ENEMY_ALERT_SECONDS);

    expect(enemy).toStrictEqual({ ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), state: EnemyState.Chase });
  });

  test("a chasing enemy runs to its attack range, then winds up", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const target = { x: 0, z: ENEMY_ATTACK_RANGE + ENEMY_RUN_SPEED };
    setEnemyState(enemy, EnemyState.Chase);
    stepEnemy(enemy, target, 1);
    stepEnemy(enemy, target, ENEMY_STEP_SECONDS);

    expect(enemy).toStrictEqual({
      ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      position: { x: 0, z: ENEMY_RUN_SPEED },
      state: EnemyState.Windup,
    });
  });

  test("a windup strikes a target within reach as it ends, then recovers", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    setEnemyState(enemy, EnemyState.Windup);
    const enemyEvent = stepEnemy(enemy, { x: 0, z: ENEMY_ATTACK_REACH }, ENEMY_WINDUP_SECONDS);

    expect(enemyEvent).toBe(EnemyEvent.Strike);
    expect(enemy.state).toBe(EnemyState.Recovery);
  });

  test("a windup misses a target out of reach", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    setEnemyState(enemy, EnemyState.Windup);

    expect(stepEnemy(enemy, { x: 0, z: ENEMY_ATTACK_REACH + 0.1 }, ENEMY_WINDUP_SECONDS)).toBeUndefined();
  });

  test("a recovered enemy waits out its cooldown before its next windup", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const target = { x: 0, z: ENEMY_ATTACK_RANGE };
    setEnemyState(enemy, EnemyState.Recovery);
    stepEnemy(enemy, target, ENEMY_RECOVERY_SECONDS);
    stepEnemy(enemy, target, ENEMY_STEP_SECONDS);

    expect(enemy).toStrictEqual({
      ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      attackCooldownSeconds: ENEMY_ATTACK_COOLDOWN_SECONDS - ENEMY_STEP_SECONDS,
      state: EnemyState.Chase,
      stateSeconds: ENEMY_STEP_SECONDS,
    });
  });

  test("a chasing enemy past its leash walks home and is healed", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const leashedDistance = ENEMY_LEASH_DISTANCE + ENEMY_RUN_SPEED;
    enemy.health = 0.1;
    enemy.position.z = leashedDistance;
    setEnemyState(enemy, EnemyState.Chase);
    stepEnemy(enemy, { x: 0, z: leashedDistance }, ENEMY_STEP_SECONDS);

    expect(enemy.state).toBe(EnemyState.Return);

    stepEnemy(enemy, { x: 0, z: leashedDistance }, leashedDistance / ENEMY_RUN_SPEED);

    expect(enemy).toStrictEqual({ ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), heading: Math.PI });
  });

  test("a broken poise is restored to full once its reset passes", () => {
    expect.hasAssertions();

    const { resetSeconds } = PoiseTypeSettingsMap[EnemyKindTraitsMap[ENEMY_CAMP_MEMBER.enemyKindId].poiseType];
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.poise = 0;
    enemy.poiseBrokenSeconds = resetSeconds;
    stepEnemy(enemy, undefined, resetSeconds);

    expect(enemy).toStrictEqual({ ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), stateSeconds: resetSeconds });
  });

  test("a death passes once, after its length", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    setEnemyState(enemy, EnemyState.Dead);

    expect(stepEnemy(enemy, undefined, ENEMY_DEATH_SECONDS)).toBe(EnemyEvent.Defeated);
    expect(stepEnemy(enemy, undefined, ENEMY_STEP_SECONDS)).toBeUndefined();
  });
});
