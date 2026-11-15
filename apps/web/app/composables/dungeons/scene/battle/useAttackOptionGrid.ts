import type { Attack } from "#src/models/dungeons/attack/Attack";

import { Grid } from "#src/models/dungeons/Grid";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";

const AttackOptionGrid = new Grid<[[Attack | undefined, Attack | undefined], [Attack | undefined, Attack | undefined]]>(
  {
    grid: [
      [undefined, undefined],
      [undefined, undefined],
    ],
  },
);

export const useAttackOptionGrid = createUseGrid(AttackOptionGrid, (grid) => {
  const battlePlayerStore = useBattlePlayerStore();
  const { attacks } = storeToRefs(battlePlayerStore);
  grid.grid = computed(() => [
    [attacks.value[0], attacks.value[1]],
    [attacks.value[2], attacks.value[3]],
  ]);
});
