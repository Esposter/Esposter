import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Direction } from "grid-engine";

import { Save } from "@/models/dungeons/data/Save";
import { Grid } from "@/models/dungeons/Grid";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerTitleMenuOption } from "@/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useDungeonsStore } from "@/store/dungeons";
import { exhaustiveGuard } from "@esposter/shared";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const { game, save } = storeToRefs(dungeonsStore);
  const isContinueEnabled = computed(() => game.value.saves.length > 0);

  const createOptionGrid = (isContinueEnabled: boolean): Grid<PlayerTitleMenuOption, [PlayerTitleMenuOption][]> =>
    isContinueEnabled
      ? new Grid(
          [[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Continue], [PlayerTitleMenuOption.Settings]],
          true,
        )
      : new Grid([[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Settings]], true);
  const optionGrid = ref(createOptionGrid(isContinueEnabled.value));

  watch(isContinueEnabled, (newIsContinueEnabled) => {
    optionGrid.value = createOptionGrid(newIsContinueEnabled);
  });

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

  return { isContinueEnabled, onPlayerInput, optionGrid };
});
