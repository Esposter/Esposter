import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Save } from "#shared/models/dungeons/data/Save";
import { Grid } from "#src/models/dungeons/Grid";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { PlayerTitleMenuOption } from "#src/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { checkIsPlayerSpecialInput } from "#src/services/dungeons/UI/input/checkIsPlayerSpecialInput";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { exhaustiveGuard } from "@esposter/shared";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const playerTitleMenuOptionGrid = markRaw(
    new Grid({
      grid: [
        [PlayerTitleMenuOption["New Game"]],
        [PlayerTitleMenuOption.Continue],
        [PlayerTitleMenuOption.Settings],
      ] as const,
      isWrapping: true,
      validate(position) {
        const value = this.getValue(position);
        return computed(() => value !== PlayerTitleMenuOption.Continue || Boolean(dungeonsStore.dungeons.save));
      },
    }),
  );

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (checkIsPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else playerTitleMenuOptionGrid.move(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (playerTitleMenuOptionGrid.value) {
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
          exhaustiveGuard(playerTitleMenuOptionGrid.value);
      }
  };

  return { onPlayerInput, playerTitleMenuOptionGrid };
});
