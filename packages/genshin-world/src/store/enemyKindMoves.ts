import type { BossMove } from "#src/models/bosses/BossMove";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";

import { EnemyKindMovesLoaderMap } from "#src/services/bosses/EnemyKindMovesLoaderMap";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { getResultAsync } from "@esposter/shared";
import { defineStore } from "pinia";
import { shallowRef } from "vue";

// How many times a kind's moves are asked for before a failure is final, so a persistent failure is never re-asked
// Forever
const ENEMY_KIND_MOVES_ATTEMPTS = 3;

// The moves of each boss kind, held once its module has loaded. The camps that spawn a kind ask for its moves, and a
// Camp Waits for them, so a boss is never on the field without its moves. Each kind loads once, and a failed load is
// Logged and Counted: the count is a change the camps waiting on the kind re-run on, so the kind is asked for again
// Until its attempts Run out, and then its camps wait for good
export const useWorldEnemyKindMovesStore = defineStore("world/enemyKindMoves", () => {
  const enemyKindMovesMap = shallowRef<Partial<Record<EnemyKindId, readonly BossMove[]>>>({});
  const enemyKindMovesFailureMap = shallowRef<Partial<Record<EnemyKindId, number>>>({});
  const requestedEnemyKindIds = new Set<EnemyKindId>();
  // Asks for the moves of the kinds given that are not held, and reports whether any of them is still on its way
  const loadEnemyKindMoves = (enemyKindIds: readonly number[]) => {
    let isLoading = false;
    for (const enemyKindId of enemyKindIds) {
      if (!checkIsEnemyKindId(enemyKindId)) continue;
      const loadMoves = EnemyKindMovesLoaderMap[enemyKindId];
      if (!loadMoves || enemyKindMovesMap.value[enemyKindId]) continue;
      isLoading = true;
      if (requestedEnemyKindIds.has(enemyKindId)) continue;
      requestedEnemyKindIds.add(enemyKindId);
      // `match(`) handles both branches, so the promise
      // oxlint-disable-next-line typescript/no-floating-promises -- it returns cannot reject and nothing waits on it
      getResultAsync(loadMoves).match(
        (moves) => {
          enemyKindMovesMap.value = { ...enemyKindMovesMap.value, [enemyKindId]: moves };
        },
        (error) => {
          console.error(error);
          const failures = (enemyKindMovesFailureMap.value[enemyKindId] ?? 0) + 1;
          enemyKindMovesFailureMap.value = { ...enemyKindMovesFailureMap.value, [enemyKindId]: failures };
          if (failures < ENEMY_KIND_MOVES_ATTEMPTS) requestedEnemyKindIds.delete(enemyKindId);
        },
      );
    }
    return isLoading;
  };
  return { enemyKindMovesFailureMap, enemyKindMovesMap, loadEnemyKindMoves };
});
