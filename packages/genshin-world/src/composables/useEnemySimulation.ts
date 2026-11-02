import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
import type { CombatState } from "#src/models/combat/CombatState";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { GroundPoint } from "genshin-engine";
import type { MaybeRefOrGetter } from "vue";

import { CombatEvent } from "#src/models/combat/CombatEvent";
import { EnemyEvent } from "#src/models/enemy/EnemyEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { EnemyType } from "#src/models/enemy/EnemyType";
import { EnemyKindMovesMap } from "#src/services/bosses/EnemyKindMovesMap";
import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { checkIsEnemyShieldBroken } from "#src/services/enemy/checkIsEnemyShieldBroken";
import { computeCampLockSources } from "#src/services/enemy/computeCampLockSources";
import { computeEnemyDrops } from "#src/services/enemy/computeEnemyDrops";
import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";
import { ENEMY_DEATH_SECONDS, ENEMY_STEP_SECONDS } from "#src/services/enemy/constants";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { stepCombat } from "#src/services/enemy/stepCombat";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { wakeEnemyCamps } from "#src/services/enemy/wakeEnemyCamps";
import { selectEnemyTaunt } from "#src/services/kit/selectEnemyTaunt";
import { createFixedStepLoop } from "genshin-engine";
import { toValue } from "vue";

// The enemies stepped on the engine's fixed-step loop: each one's elements age, its AI moves it at the body or a taunt,
// And what its step brings is reported as it happens, a strike, a defeat, a shield break, a camp cleared or the party's
// Combat changing. The loop is returned for the scene to advance each frame, so a pause or a menu holds it
export const useEnemySimulation = ({
  campLocks,
  enemyMap,
  enemyTables,
  getCampEnemyTypes,
  getEnemyCamps,
  getWorldNow,
  kitEffectState,
  onCampCleared,
  onDefeat,
  onEnterCombat,
  onLeaveCombat,
  onSaveBossDefeat,
  onSaveRespawn,
  onShieldBreak,
  onStrike,
  spawnKeyDefeatedAtMap,
  target,
}: {
  campLocks: { update: (campLocks: ChestLockSource[]) => void };
  enemyMap: Map<string, Enemy>;
  enemyTables: MaybeRefOrGetter<EnemyTables>;
  getCampEnemyTypes: (members: EnemyCamp["members"]) => EnemyType[];
  getEnemyCamps: () => EnemyCamp[];
  getWorldNow: () => Temporal.Instant;
  kitEffectState: MaybeRefOrGetter<KitEffectState>;
  onCampCleared: (camp: ClearedCamp) => void;
  onDefeat: (enemy: Enemy, enemyDrops: EnemyDrops) => void;
  onEnterCombat: () => void;
  onLeaveCombat: () => void;
  onSaveBossDefeat: (spawnKey: string, defeatedAt: string) => void;
  onSaveRespawn: (spawnKey: string, respawnAt: string) => void;
  onShieldBreak: (enemy: Enemy) => void;
  onStrike: (enemy: Enemy, taunt: KitTaunt | undefined) => void;
  spawnKeyDefeatedAtMap: Map<string, Temporal.Instant>;
  target: MaybeRefOrGetter<GroundPoint | undefined>;
}) => {
  // The party's combat as the enemies aggravated on it hold it, kept for the page's life
  const combat: CombatState = { clearSeconds: 0, isInCombat: false };
  // The enemies whose shield the last step saw broken, so a shield that is still broken counts as one break and not one
  // For each step
  const brokenShieldEnemies = new WeakSet<Enemy>();
  const getCampLocks = (): ChestLockSource[] => computeCampLockSources(getEnemyCamps(), enemyMap);
  return createFixedStepLoop(ENEMY_STEP_SECONDS, () => {
    let isAnyDefeated = false;
    for (const enemy of enemyMap.values()) {
      // The reactions its elements bring on their own as they age wait on it for the kit on the field to price
      advanceElementalState(enemy.elementalState, ENEMY_STEP_SECONDS, enemy.elementalReactions);
      const taunt = selectEnemyTaunt(enemy, toValue(kitEffectState).effects);
      const enemyEvent = stepEnemy(
        enemy,
        taunt ? taunt.body.position : toValue(target),
        ENEMY_STEP_SECONDS,
        checkIsEnemyKindId(enemy.enemyKindId) ? EnemyKindMovesMap[enemy.enemyKindId] : undefined,
      );
      // A shield stands again as its stagger ends or the enemy arrives home, and can break again, so a shield the step sees
      // Broken that it did not see broken before is a break. It is read after the step, where a shield stands again, so a
      // Break after that stand is seen as a new one
      if (!checkIsEnemyShieldBroken(enemy)) brokenShieldEnemies.delete(enemy);
      else if (!brokenShieldEnemies.has(enemy)) {
        brokenShieldEnemies.add(enemy);
        onShieldBreak(enemy);
      }
      if (enemyEvent === EnemyEvent.Strike) onStrike(enemy, taunt);
      else if (enemyEvent === EnemyEvent.Defeated) {
        isAnyDefeated = true;
        const enemyKind = getEnemyKind(toValue(enemyTables).enemyKindMap, enemy.enemyKindId);
        const spawnKey = getSpawnKey(enemy.campId, enemy.id);
        const defeatedAt = getWorldNow();
        spawnKeyDefeatedAtMap.set(spawnKey, defeatedAt);
        onDefeat(
          enemy,
          computeEnemyDrops(enemyKind, enemy.traits, enemy.level, () => Math.random()),
        );
        // A camp is cleared once every one of its members is defeated, which this defeat completes when they all are down
        const camp = getEnemyCamps().find(({ id }) => id === enemy.campId);
        // A camp with no boss brings each defeated member back at an instant the save keeps
        const campEnemyTypes = camp && getCampEnemyTypes(camp.members);
        const respawnAt = campEnemyTypes && computeEnemyRespawnTime(campEnemyTypes, defeatedAt);
        if (respawnAt) onSaveRespawn(spawnKey, respawnAt.toString());
        // A boss's defeat is kept too, since its return waits on a claim or a teleport out of its area that the save holds
        if (campEnemyTypes?.includes(EnemyType.Boss)) onSaveBossDefeat(spawnKey, defeatedAt.toString());
        const [firstMember] = camp?.members ?? [];
        if (camp && firstMember && camp.members.every(({ id }) => spawnKeyDefeatedAtMap.has(getSpawnKey(camp.id, id))))
          onCampCleared({ id: camp.id, position: firstMember.position });
      }
    }

    if (isAnyDefeated)
      for (const [spawnKey, { state, stateSeconds }] of enemyMap)
        if (state === EnemyState.Dead && stateSeconds >= ENEMY_DEATH_SECONDS) enemyMap.delete(spawnKey);
    const combatEvent = stepCombat(combat, enemyMap.values(), ENEMY_STEP_SECONDS);
    if (combatEvent === CombatEvent.Enter) onEnterCombat();
    else if (combatEvent === CombatEvent.Leave) onLeaveCombat();
    wakeEnemyCamps([...enemyMap.values()]);
    campLocks.update(getCampLocks());
  });
};
