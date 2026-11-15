import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Save } from "#shared/models/dungeons/data/Save";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { PlayerTitleMenuOption } from "#src/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { PlayerTitleMenuOptionGrid } from "#src/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
import { checkIsPlayerSpecialInput } from "#src/services/dungeons/UI/input/checkIsPlayerSpecialInput";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { exhaustiveGuard } from "@esposter/shared";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (checkIsPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else PlayerTitleMenuOptionGrid.move(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (PlayerTitleMenuOptionGrid.value) {
        case PlayerTitleMenuOption.Continue: {
          const { save } = dungeonsStore.dungeons;
          if (!save) return;

          dungeonsStore.save = save;
          fadeSwitchToScene(scene, SceneKey.World);
          return;
        }
        case PlayerTitleMenuOption.Settings:
          fadeSwitchToScene(scene, SceneKey.Settings);
          return;
        case PlayerTitleMenuOption["New Game"]:
          dungeonsStore.save = new Save();
          fadeSwitchToScene(scene, SceneKey.World);
          return;
        default:
          exhaustiveGuard(PlayerTitleMenuOptionGrid.value);
      }
  };

  return { onPlayerInput };
});
