import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyHit } from "#src/models/enemy/EnemyHit";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";
import { setEnemyState } from "#src/services/enemy/setEnemyState";

// A hit combat lands on an enemy, written into it in place. Its health falls, and the energy of every threshold it
// Falls to is dropped, each once for the enemy's life however it is healed. A hit on a broken poise, or one that
// Breaks it, staggers it, and any other hit sets an unengaged enemy on its attacker. A returning or dead enemy is
// Immune, and any other hit restarts the seconds since the enemy was last hit. It returns the energy the hit dropped
export const damageEnemy = (enemy: Enemy, { damage, poiseDamage }: EnemyHit): EnergyDrop[] => {
  if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) return [];
  enemy.hitSeconds = 0;
  const { energyDrops, poiseType } = EnemyKindTraitsMap[enemy.enemyKindId];
  enemy.health = Math.max(0, enemy.health - damage);
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  const droppedEnergy: EnergyDrop[] = [];
  for (const energyDrop of energyDrops.slice(enemy.droppedThresholdCount)) {
    if (healthPercent > energyDrop.healthPercent) break;
    droppedEnergy.push(energyDrop);
    enemy.droppedThresholdCount += 1;
  }

  if (enemy.health === 0) {
    setEnemyState(enemy, EnemyState.Dead);
    return droppedEnergy;
  }

  const { endurance, resetSeconds } = PoiseTypeSettingsMap[poiseType];
  const isPoiseBroken = enemy.poiseBrokenSeconds > 0;
  if (!isPoiseBroken) enemy.poise = Math.max(0, enemy.poise - poiseDamage * endurance);
  if (isPoiseBroken || enemy.poise === 0) {
    if (!isPoiseBroken) enemy.poiseBrokenSeconds = resetSeconds;
    setEnemyState(enemy, EnemyState.Stagger);
  } else if ([EnemyState.Alert, EnemyState.Idle].includes(enemy.state)) setEnemyState(enemy, EnemyState.Chase);
  return droppedEnergy;
};
