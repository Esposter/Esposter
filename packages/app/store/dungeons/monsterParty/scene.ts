import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
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
  const monsterPartyOptionGrid = ref() as Ref<
    Grid<Monster | PlayerSpecialInput.Cancel, (Monster | PlayerSpecialInput.Cancel)[][]>
  >;

  watch(
    monstersGrid,
    (newMonstersGrid) => {
      monsterPartyOptionGrid.value = new Grid(
        [...newMonstersGrid, Array(newMonstersGrid[0]?.length ?? 0).fill(PlayerSpecialInput.Cancel)],
        true,
      );
    },
    { immediate: true },
  );

  const sceneMode = ref(SceneMode.Default);
  const monsterIdToMove = ref<string>();

  return {
    monstersGrid,
    monsterPartyOptionGrid,
    sceneMode,
    monsterIdToMove,
  };
});
