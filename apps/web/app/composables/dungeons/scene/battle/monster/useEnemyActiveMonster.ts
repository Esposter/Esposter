import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { NotFoundError } from "@esposter/shared";

// The enemy's active monster as a reader of the battle takes it, which throws naming the reader when it is not set yet
export const useEnemyActiveMonster = (name: string) => {
  const enemyStore = useEnemyStore();

  return computed(() => {
    if (!enemyStore.activeMonster) throw new NotFoundError(name, "enemy active monster");

    return enemyStore.activeMonster;
  });
};
