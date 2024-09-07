import type { Monster } from "@/models/dungeons/monster/Monster";

import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { COLUMN_SIZE, ROW_SIZE } from "@/services/dungeons/scene/monsterParty/constants";
import { usePlayerStore } from "@/store/dungeons/player";

export const useMonsterPartySceneStore = defineStore("dungeons/monsterParty/scene", () => {
  const playerStore = usePlayerStore();
  const monsters = computed({
    get: () => playerStore.player.monsters,
    set: (newMonsters) => {
      playerStore.player.monsters = newMonsters;
    },
  });
  const isPlayerFainted = computed(() => monsters.value.every(({ status }) => status.hp === 0));
  const monstersGrid = computed(() => {
    const monstersGrid: Monster[][] = [];
    for (let i = 0; i < Math.min(ROW_SIZE * COLUMN_SIZE, monsters.value.length); i += COLUMN_SIZE)
      monstersGrid.push(monsters.value.slice(i, Math.min(i + COLUMN_SIZE, monsters.value.length)));
    return monstersGrid;
  });
  const sceneMode = ref(SceneMode.Default);
  const monsterIdToMove = ref<string>();
  return {
    isPlayerFainted,
    monsterIdToMove,
    monsters,
    monstersGrid,
    sceneMode,
  };
});
