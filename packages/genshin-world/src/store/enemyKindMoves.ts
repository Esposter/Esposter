import type { BossMove } from "#src/models/bosses/BossMove";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";

import { EnemyKindMovesLoaderMap } from "#src/services/bosses/EnemyKindMovesLoaderMap";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { getResultAsync } from "@esposter/shared";
import { defineStore } from "pinia";
import { shallowRef } from "vue";

// The moves of each boss kind, held once its module has loaded. The camps that spawn a kind ask for its moves, and a camp
// Waits for them, so a boss is never on the field without its moves. Each kind loads once, and a failed load is logged and
// Asked for again by the next camp that waits on it
export const useWorldEnemyKindMovesStore = defineStore("world/enemyKindMoves", () => {
  const enemyKindMovesMap = shallowRef<Partial<Record<EnemyKindId, readonly BossMove[]>>>({});
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
      // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
      getResultAsync(loadMoves).match(
        (moves) => {
          enemyKindMovesMap.value = { ...enemyKindMovesMap.value, [enemyKindId]: moves };
        },
        (error) => {
          requestedEnemyKindIds.delete(enemyKindId);
          console.error(error);
        },
      );
    }
    return isLoading;
  };
  return { enemyKindMovesMap, loadEnemyKindMoves };
});
