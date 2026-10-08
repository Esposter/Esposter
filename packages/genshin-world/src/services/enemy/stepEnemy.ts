import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

import { EnemyEvent } from "#src/models/enemy/EnemyEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import {
  ENEMY_AGGRO_RANGE,
  ENEMY_ALERT_SECONDS,
  ENEMY_ARRIVAL_DISTANCE,
  ENEMY_ATTACK_COOLDOWN_SECONDS,
  ENEMY_ATTACK_RANGE,
  ENEMY_ATTACK_REACH,
  ENEMY_DEATH_SECONDS,
  ENEMY_LEASH_DISTANCE,
  ENEMY_RECOVERY_SECONDS,
  ENEMY_RUN_SPEED,
  ENEMY_STAGGER_SECONDS,
  ENEMY_WALK_SPEED,
  ENEMY_WINDUP_SECONDS,
} from "#src/services/enemy/constants";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { exhaustiveGuard } from "@esposter/shared";

const computeDistance = (from: GroundPoint, to: GroundPoint): number => Math.hypot(to.x - from.x, to.z - from.z);

const face = (enemy: Enemy, point: GroundPoint): void => {
  if (computeDistance(enemy.position, point) === 0) return;
  enemy.heading = Math.atan2(point.x - enemy.position.x, point.z - enemy.position.z);
};
// Walks an enemy at most `distance` toward a point, facing it, and returns whether it has arrived
const walkToward = (enemy: Enemy, point: GroundPoint, distance: number): boolean => {
  face(enemy, point);
  const remaining = computeDistance(enemy.position, point);
  if (remaining <= Math.max(distance, ENEMY_ARRIVAL_DISTANCE)) {
    enemy.position.x = point.x;
    enemy.position.z = point.z;
    return true;
  }

  enemy.position.x += ((point.x - enemy.position.x) / remaining) * distance;
  enemy.position.z += ((point.z - enemy.position.z) / remaining) * distance;
  return false;
};

const stepPoise = (enemy: Enemy, stepSeconds: number): void => {
  const { length, refillPerSecond } = PoiseTypeSettingsMap[EnemyKindTraitsMap[enemy.enemyKindId].poiseType];
  if (enemy.poiseBrokenSeconds > 0) {
    enemy.poiseBrokenSeconds = Math.max(0, enemy.poiseBrokenSeconds - stepSeconds);
    if (enemy.poiseBrokenSeconds === 0) enemy.poise = length;
  } else enemy.poise = Math.min(length, enemy.poise + refillPerSecond * stepSeconds);
};
// One fixed step of an enemy's AI, toward a target on the ground or none when nothing is there to fight, written into
// The enemy in place. It returns what the world acts on: a strike that reached its target, or a death that has passed
export const stepEnemy = (
  enemy: Enemy,
  target: GroundPoint | undefined,
  stepSeconds: number,
): EnemyEvent | undefined => {
  enemy.hitSeconds += stepSeconds;
  enemy.stateSeconds += stepSeconds;
  enemy.attackCooldownSeconds = Math.max(0, enemy.attackCooldownSeconds - stepSeconds);
  if (enemy.state !== EnemyState.Dead) stepPoise(enemy, stepSeconds);

  switch (enemy.state) {
    case EnemyState.Alert:
      if (target) face(enemy, target);
      if (enemy.stateSeconds >= ENEMY_ALERT_SECONDS) setEnemyState(enemy, EnemyState.Chase);
      return undefined;
    case EnemyState.Chase: {
      if (!target || computeDistance(enemy.position, enemy.home) > ENEMY_LEASH_DISTANCE) {
        setEnemyState(enemy, EnemyState.Return);
        return undefined;
      }

      const targetDistance = computeDistance(enemy.position, target);
      if (targetDistance > ENEMY_ATTACK_RANGE)
        walkToward(enemy, target, Math.min(ENEMY_RUN_SPEED * stepSeconds, targetDistance - ENEMY_ATTACK_RANGE));
      else {
        face(enemy, target);
        if (enemy.attackCooldownSeconds === 0) setEnemyState(enemy, EnemyState.Windup);
      }
      return undefined;
    }
    case EnemyState.Dead:
      // The death passes on the one step that crosses its length
      return enemy.stateSeconds >= ENEMY_DEATH_SECONDS && enemy.stateSeconds - stepSeconds < ENEMY_DEATH_SECONDS
        ? EnemyEvent.Defeated
        : undefined;
    case EnemyState.Idle: {
      if (target && computeDistance(enemy.position, target) <= ENEMY_AGGRO_RANGE) {
        face(enemy, target);
        setEnemyState(enemy, EnemyState.Alert);
        return undefined;
      }

      const patrolPoint = enemy.patrol[enemy.patrolIndex];
      if (patrolPoint && walkToward(enemy, patrolPoint, ENEMY_WALK_SPEED * stepSeconds))
        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
      return undefined;
    }
    case EnemyState.Recovery:
      if (enemy.stateSeconds >= ENEMY_RECOVERY_SECONDS) {
        enemy.attackCooldownSeconds = ENEMY_ATTACK_COOLDOWN_SECONDS;
        setEnemyState(enemy, EnemyState.Chase);
      }
      return undefined;
    case EnemyState.Return:
      // Home, it is healed and its poise restored, as the game heals an enemy that gives up
      if (walkToward(enemy, enemy.home, ENEMY_RUN_SPEED * stepSeconds)) {
        enemy.health = enemy.maxHealth;
        enemy.poise = PoiseTypeSettingsMap[EnemyKindTraitsMap[enemy.enemyKindId].poiseType].length;
        enemy.poiseBrokenSeconds = 0;
        setEnemyState(enemy, EnemyState.Idle);
      }
      return undefined;
    case EnemyState.Stagger:
      if (enemy.stateSeconds >= ENEMY_STAGGER_SECONDS) setEnemyState(enemy, EnemyState.Chase);
      return undefined;
    case EnemyState.Windup:
      if (target) face(enemy, target);
      if (enemy.stateSeconds < ENEMY_WINDUP_SECONDS) return undefined;
      setEnemyState(enemy, EnemyState.Recovery);
      return target && computeDistance(enemy.position, target) <= ENEMY_ATTACK_REACH ? EnemyEvent.Strike : undefined;
    default:
      return exhaustiveGuard(enemy.state);
  }
};
