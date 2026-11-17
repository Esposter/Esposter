import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Grid } from "#src/models/dungeons/Grid";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { MenuOption } from "#src/models/dungeons/scene/world/MenuOption";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { transitionFrom } from "#src/services/dungeons/scene/transitionFrom";
import { checkIsMovingDirection } from "#src/services/dungeons/UI/input/checkIsMovingDirection";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useWorldDialogStore } from "#src/store/dungeons/world/dialog";
import { exhaustiveGuard } from "@esposter/shared";

export const useWorldMenuStore = defineStore("dungeons/world/menu", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene, saveData } = dungeonsStore;
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const isMenuVisible = ref(false);
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const worldMenuOptionGrid = markRaw(
    new Grid({
      grid: [[MenuOption.Monsters], [MenuOption.Inventory], [MenuOption.Save], [MenuOption.Exit]] as const,
      isWrapping: true,
    }),
  );

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    const { launchScene } = transitionFrom(scene.scene.key);

    if (!isMenuVisible.value)
      if (justDownInput === PlayerSpecialInput.Enter) {
        isMenuVisible.value = true;
        return true;
      } else return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (worldMenuOptionGrid.value) {
        case MenuOption.Exit:
          isMenuVisible.value = false;
          fadeSwitchToScene(scene, SceneKey.Title);
          break;
        case MenuOption.Inventory:
          launchScene(scene, SceneKey.Inventory);
          break;
        case MenuOption.Monsters:
          launchScene(scene, SceneKey.MonsterParty);
          break;
        case MenuOption.Save:
          saveData();
          await showMessages(scene, [{ text: "Game has been saved." }]);
          break;
        default:
          exhaustiveGuard(worldMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel)
      isMenuVisible.value = false;
    else if (checkIsMovingDirection(justDownInput)) worldMenuOptionGrid.move(justDownInput);

    return true;
  };

  return { isMenuVisible, onPlayerInput, worldMenuOptionGrid };
});
