import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const MonsterPartyOptionGrid = new Grid<Monster | PlayerSpecialInput.Cancel, (Monster | PlayerSpecialInput.Cancel)[][]>(
  {
    grid: [],
    wrap: true,
  },
);

let isInitialized = false;

export const useMonsterPartyOptionGrid = () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monstersGrid } = storeToRefs(monsterPartySceneStore);

  if (!isInitialized) {
    MonsterPartyOptionGrid.grid = computed(() => {
      const grid: (Monster | PlayerSpecialInput.Cancel)[][] = [...monstersGrid.value];
      const rowSize = monstersGrid.value[0]?.length ?? 0;
      if (rowSize > 0)
        grid.push(Array.from<Monster | PlayerSpecialInput.Cancel>({ length: rowSize }).fill(PlayerSpecialInput.Cancel));
      return grid;
    });
    isInitialized = true;
  }

  return MonsterPartyOptionGrid;
};
