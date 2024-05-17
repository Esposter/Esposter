import { Grid } from "@/models/dungeons/Grid";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { Save } from "@/models/dungeons/data/Save";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { PlayerTitleMenuOption } from "@/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "esposter-shared";
import type { Direction } from "grid-engine";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const gameStore = useGameStore();
  const { fadeSwitchToScene } = gameStore;
  const { game, save } = storeToRefs(gameStore);
  const isContinueEnabled = computed(() => game.value.saves.length > 0);
  const optionGrid = ref() as Ref<Grid<PlayerTitleMenuOption, [PlayerTitleMenuOption][]>>;

  watch(
    isContinueEnabled,
    (newIsContinueEnabled) => {
      optionGrid.value = newIsContinueEnabled
        ? new Grid(
            [[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Continue], [PlayerTitleMenuOption.Settings]],
            true,
          )
        : new Grid([[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Settings]], true);
    },
    { immediate: true },
  );

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (optionGrid.value.value) {
        case PlayerTitleMenuOption["New Game"]:
          save.value = new Save();
          fadeSwitchToScene(scene, SceneKey.World);
          return;
        case PlayerTitleMenuOption.Continue:
          save.value = game.value.saves[0];
          fadeSwitchToScene(scene, SceneKey.World);
          return;
        case PlayerTitleMenuOption.Settings:
          fadeSwitchToScene(scene, SceneKey.Settings);
          return;
        default:
          exhaustiveGuard(optionGrid.value.value);
      }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return { isContinueEnabled, optionGrid, onPlayerInput };
});
