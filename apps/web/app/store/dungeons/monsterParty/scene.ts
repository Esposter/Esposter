import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { MONSTER_PARTY_MAX_LENGTH } from "#shared/services/dungeons/constants";
import { Grid } from "#src/models/dungeons/Grid";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { checkIsMonsterFainted } from "#src/services/dungeons/monster/checkIsMonsterFainted";
import { COLUMN_SIZE } from "#src/services/dungeons/scene/monsterParty/constants";
import { usePlayerStore } from "#src/store/dungeons/player";

export const useMonsterPartySceneStore = defineStore("dungeons/monsterParty/scene", () => {
  const playerStore = usePlayerStore();
  const monsters = computed({
    get: () => playerStore.player.monsters,
    set: (newMonsters) => {
      playerStore.player.monsters = newMonsters;
    },
  });
  const isPlayerFainted = computed(() => monsters.value.every((monster) => checkIsMonsterFainted(monster)));
  const monstersGrid = computed(() => {
    const grid: Monster[][] = [];
    for (let index = 0; index < Math.min(MONSTER_PARTY_MAX_LENGTH, monsters.value.length); index += COLUMN_SIZE)
      grid.push(monsters.value.slice(index, index + COLUMN_SIZE));
    return grid;
  });
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const monsterPartyOptionGrid = markRaw(
    new Grid<(Monster | typeof PlayerSpecialInput.Cancel)[][]>({
      grid: computed(() => {
        const newGrid: (Monster | typeof PlayerSpecialInput.Cancel)[][] = [...monstersGrid.value];
        const rowSize = monstersGrid.value[0]?.length ?? 0;
        if (rowSize > 0)
          newGrid.push(
            Array.from<Monster | typeof PlayerSpecialInput.Cancel>({ length: rowSize }).fill(PlayerSpecialInput.Cancel),
          );
        return newGrid;
      }),
      isWrapping: true,
    }),
  );
  const sceneMode = ref<SceneMode>(SceneMode.Default);
  const monsterIdToMove = ref("");
  return { isPlayerFainted, monsterIdToMove, monsterPartyOptionGrid, monsters, monstersGrid, sceneMode };
});
