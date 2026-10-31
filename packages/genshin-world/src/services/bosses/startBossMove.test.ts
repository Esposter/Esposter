import type { BossMove } from "#src/models/bosses/BossMove";
import type { Enemy } from "#src/models/enemy/Enemy";

import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { PoiseType } from "#src/models/enemy/PoiseType";
import { startBossMove } from "#src/services/bosses/startBossMove";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { describe, expect, test } from "vitest";

// A boss with every other field made up, in the state the test sets
const createBoss = (state: EnemyState): Enemy => ({
  attackCooldownSeconds: 3,
  campId: "boss-camp",
  droppedThresholdCount: 0,
  elementalNodePulsesLeft: 0,
  elementalReactions: [],
  elementalState: createElementalState(),
  enemyFamily: EnemyFamily.EnemiesOfNote,
  enemyKindId: EnemyKindId.StormterrorDvalin,
  heading: 0,
  health: 1,
  hitSeconds: Infinity,
  home: { x: 0, z: 0 },
  id: "boss",
  internalCooldownMap: new Map(),
  level: 1,
  maxHealth: 1,
  moondriftHarmonyHits: [],
  moveIndex: 0,
  patrol: [],
  patrolIndex: 0,
  poise: 1,
  poiseBrokenSeconds: 0,
  position: { x: 0, z: 0 },
  state,
  stateSeconds: 0,
  statuses: [],
  traits: { energyDrops: [], poiseType: PoiseType.Boss },
});

describe(startBossMove, () => {
  // Two made-up moves, the boss making the first of them next
  const MOVES: BossMove[] = [
    { atkPercent: 100, name: "Made-up Sweep", recoverySeconds: 1, windupSeconds: 1 },
    { atkPercent: 50, name: "Made-up Pulse", recoverySeconds: 2, windupSeconds: 0.5 },
  ];

  test("starts the named move as the boss's next, and winds it up on the next step within attack range", () => {
    expect.hasAssertions();

    const boss = createBoss(EnemyState.Chase);

    expect(startBossMove(boss, MOVES, "Made-up Pulse")).toBe(true);
    expect(boss.moveIndex).toBe(1);
    expect(boss.attackCooldownSeconds).toBe(0);
    // The boss stands on its target, so its step finds the target in range and winds the move up
    stepEnemy(boss, boss.position, 1);
    expect(boss.state).toBe(EnemyState.Windup);
  });

  test("leaves a boss that is mid-move on the move it is making", () => {
    expect.hasAssertions();

    const boss = createBoss(EnemyState.Windup);

    expect(startBossMove(boss, MOVES, "Made-up Pulse")).toBe(false);
    expect(boss.moveIndex).toBe(0);
    expect(boss.attackCooldownSeconds).toBe(3);
  });

  test("starts nothing for a move the boss does not make", () => {
    expect.hasAssertions();

    const boss = createBoss(EnemyState.Chase);

    expect(startBossMove(boss, MOVES, "Made-up Platform Attack")).toBe(false);
    expect(boss.moveIndex).toBe(0);
  });
});
