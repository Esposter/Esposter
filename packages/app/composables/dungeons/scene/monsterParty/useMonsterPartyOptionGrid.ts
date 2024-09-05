import type { Monster } from "@/models/dungeons/monster/Monster";

import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const MonsterPartyOptionGrid = new Grid<Monster | PlayerSpecialInput.Cancel, (Monster | PlayerSpecialInput.Cancel)[][]>(
  {
    grid: [],
    wrap: true,
  },
);

export const useMonsterPartyOptionGrid = () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monstersGrid } = storeToRefs(monsterPartySceneStore);
  MonsterPartyOptionGrid.grid = computed(() => {
    const grid = [...monstersGrid.value];
    const rowSize = monstersGrid.value[0]?.length ?? 0;
    if (rowSize > 0) grid.push(Array(rowSize).fill(PlayerSpecialInput.Cancel));
    return grid;
  });
  return MonsterPartyOptionGrid;
};
