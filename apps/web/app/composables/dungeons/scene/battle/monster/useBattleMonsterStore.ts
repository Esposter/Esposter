import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";

// A battle has exactly two sides, and everything that animates or damages a monster works on either
export const useBattleMonsterStore = (isEnemy?: boolean) => (isEnemy ? useEnemyStore() : useBattlePlayerStore());
