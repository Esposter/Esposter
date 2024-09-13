import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Direction } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaser";

import { Save } from "@/models/dungeons/data/Save";
import { PlayerTitleMenuOption } from "@/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { PlayerTitleMenuOptionGrid } from "@/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useDungeonsStore } from "@/store/dungeons";
import { exhaustiveGuard } from "@esposter/shared";
import { SceneKey } from "vue-phaser";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const isContinueEnabled = computed(() => dungeonsStore.game.saves.length > 0);

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (PlayerTitleMenuOptionGrid.value) {
        case PlayerTitleMenuOption["New Game"]:
          dungeonsStore.save = new Save();
          fadeSwitchToScene(scene, SceneKey.World);
          return;
        case PlayerTitleMenuOption.Continue:
          dungeonsStore.save = dungeonsStore.game.saves[0];
          fadeSwitchToScene(scene, SceneKey.World);
          return;
        case PlayerTitleMenuOption.Settings:
          fadeSwitchToScene(scene, SceneKey.Settings);
          return;
        default:
          exhaustiveGuard(PlayerTitleMenuOptionGrid.value);
      }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    PlayerTitleMenuOptionGrid.move(direction);
  };

  return { isContinueEnabled, onPlayerInput };
});
