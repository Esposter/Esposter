import type { Monster } from "@/models/dungeons/monster/Monster";

import { Grid } from "@/models/dungeons/Grid";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { COLUMN_SIZE, ROW_SIZE } from "@/services/dungeons/scene/monsterParty/constants";
import { usePlayerStore } from "@/store/dungeons/player";

export const useMonsterPartySceneStore = defineStore("dungeons/monsterParty/scene", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const monsters = computed({
    get: () => player.value.monsters,
    set: (newMonsters) => {
      player.value.monsters = newMonsters;
    },
  });
  const monstersGrid = computed(() => {
    const monstersGrid: Monster[][] = [];
    for (let i = 0; i < Math.min(ROW_SIZE * COLUMN_SIZE, monsters.value.length); i += COLUMN_SIZE)
      monstersGrid.push(monsters.value.slice(i, Math.min(i + COLUMN_SIZE, monsters.value.length)));
    return monstersGrid;
  });

  const createMonsterPartyOptionGrid = (newMonstersGrid: Monster[][]) => {
    const grid = [...newMonstersGrid];
    const rowSize = newMonstersGrid[0]?.length ?? 0;
    if (rowSize > 0) grid.push(Array(rowSize).fill(PlayerSpecialInput.Cancel));
    return new Grid<Monster | PlayerSpecialInput.Cancel, (Monster | PlayerSpecialInput.Cancel)[][]>({
      grid,
      wrap: true,
    });
  };
  const monsterPartyOptionGrid = ref(createMonsterPartyOptionGrid(monstersGrid.value));

  watch(monstersGrid, (newMonstersGrid) => {
    monsterPartyOptionGrid.value = createMonsterPartyOptionGrid(newMonstersGrid);
  });

  const sceneMode = ref(SceneMode.Default);
  const monsterIdToMove = ref<string>();

  return {
    monsterIdToMove,
    monsterPartyOptionGrid,
    monstersGrid,
    sceneMode,
  };
});
