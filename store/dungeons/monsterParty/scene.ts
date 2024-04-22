import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Monster } from "@/models/dungeons/monster/Monster";
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
    for (let i = 0; i < Math.min(monsters.value.length, ROW_SIZE * COLUMN_SIZE); i += COLUMN_SIZE)
      monstersGrid.push(monsters.value.slice(i, i + COLUMN_SIZE));
    return monstersGrid;
  });
  const optionGrid = ref() as Ref<Grid<Monster | PlayerSpecialInput.Cancel, (Monster | PlayerSpecialInput.Cancel)[][]>>;

  watch(
    monstersGrid,
    (newMonstersGrid) => {
      optionGrid.value = new Grid(
        [...newMonstersGrid, Array(newMonstersGrid[0]?.length ?? 0).fill(PlayerSpecialInput.Cancel)],
        true,
      );
    },
    { immediate: true },
  );

  const activeMonsterIndex = ref(0);
  const activeMonster = computed({
    get: () => player.value.monsters[activeMonsterIndex.value],
    set: (newActiveMonster) => {
      player.value.monsters[activeMonsterIndex.value] = newActiveMonster;
    },
  });

  return {
    monstersGrid,
    optionGrid,
    activeMonsterIndex,
    activeMonster,
  };
});
