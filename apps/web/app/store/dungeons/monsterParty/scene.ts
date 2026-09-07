import type { Monster } from "#shared/models/dungeons/monster/Monster";

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
  const isPlayerFainted = computed(() => monsters.value.every(({ status }) => status.health === 0));
  const monstersGrid = computed(() => {
    const grid: Monster[][] = [];
    for (let i = 0; i < Math.min(ROW_SIZE * COLUMN_SIZE, monsters.value.length); i += COLUMN_SIZE)
      grid.push(monsters.value.slice(i, Math.min(i + COLUMN_SIZE, monsters.value.length)));
    return grid;
  });
  const sceneMode = ref(SceneMode.Default);
  const monsterIdToMove = ref("");
  return {
    isPlayerFainted,
    monsterIdToMove,
    monsters,
    monstersGrid,
    sceneMode,
  };
});
