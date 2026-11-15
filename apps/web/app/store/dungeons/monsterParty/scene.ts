import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { MONSTER_PARTY_MAX_LENGTH } from "#shared/services/dungeons/constants";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
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
  const sceneMode = ref<SceneMode>(SceneMode.Default);
  const monsterIdToMove = ref("");
  return { isPlayerFainted, monsterIdToMove, monsters, monstersGrid, sceneMode };
});
