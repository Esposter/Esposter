import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { MenuOption } from "#src/models/dungeons/scene/world/MenuOption";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { WorldMenuOptionGrid } from "#src/services/dungeons/scene/world/WorldMenuOptionGrid";
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

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    const { launchScene } = usePreviousScene(scene.scene.key);

    if (!isMenuVisible.value)
      if (justDownInput === PlayerSpecialInput.Enter) {
        isMenuVisible.value = true;
        return true;
      } else return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (WorldMenuOptionGrid.value) {
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
          exhaustiveGuard(WorldMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel)
      isMenuVisible.value = false;
    else if (checkIsMovingDirection(justDownInput)) WorldMenuOptionGrid.move(justDownInput);

    return true;
  };

  return { isMenuVisible, onPlayerInput };
});
