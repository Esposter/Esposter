import { Grid } from "@/models/dungeons/Grid";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { COLUMN_SIZE, ROW_SIZE } from "@/services/dungeons/monsterParty/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useMonsterPartySceneStore = defineStore("dungeons/monsterParty/scene", () => {
  const gameStore = useGameStore();
  const { fadeSwitchToScene, fadeSwitchToPreviousScene } = gameStore;
  const { save } = storeToRefs(gameStore);
  const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
  const { monsterIndex } = storeToRefs(monsterDetailsSceneStore);
  const monsters = computed({
    get: () => save.value.player.monsters,
    set: (newMonsters) => {
      save.value.player.monsters = newMonsters;
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
      optionGrid.value = new Grid([...newMonstersGrid, Array(COLUMN_SIZE).fill(PlayerSpecialInput.Cancel)]);
    },
    { immediate: true },
  );

  const onPlayerInput = (justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        monsterIndex.value = optionGrid.value.index;
        fadeSwitchToScene(SceneKey.MonsterDetails);
        return;
      case PlayerSpecialInput.Cancel:
        fadeSwitchToPreviousScene();
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return {
    monsters,
    monstersGrid,
    optionGrid,
    onPlayerInput,
  };
});
