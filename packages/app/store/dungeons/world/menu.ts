import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { MenuOption } from "@/models/dungeons/scene/world/MenuOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { MenuOptionGrid } from "@/services/dungeons/scene/world/MenuOptionGrid";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useDungeonsStore } from "@/store/dungeons";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { exhaustiveGuard } from "@esposter/shared";

export const useMenuStore = defineStore("dungeons/world/menu", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene, saveData } = dungeonsStore;
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref(MenuOptionGrid);

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    const { launchScene } = usePreviousScene(scene.scene.key);

    if (!isMenuVisible.value)
      if (justDownInput === PlayerSpecialInput.Enter) {
        isMenuVisible.value = true;
        return true;
      } else return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (menuOptionGrid.value.value) {
        case MenuOption.Monsters:
          launchScene(scene, SceneKey.MonsterParty);
          break;
        case MenuOption.Inventory:
          launchScene(scene, SceneKey.Inventory);
          break;
        case MenuOption.Save:
          await saveData();
          await showMessages(scene, [{ text: "Game has been saved." }]);
          break;
        case MenuOption.Exit:
          isMenuVisible.value = false;
          fadeSwitchToScene(scene, SceneKey.Title);
          break;
        default:
          exhaustiveGuard(menuOptionGrid.value.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel)
      isMenuVisible.value = false;
    else if (isMovingDirection(justDownInput)) menuOptionGrid.value.move(justDownInput);

    return true;
  };

  return { isMenuVisible, menuOptionGrid, onPlayerInput };
});
