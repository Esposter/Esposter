import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { MenuOption } from "@/models/dungeons/scene/world/MenuOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { WorldMenuOptionGrid } from "@/services/dungeons/scene/world/WorldMenuOptionGrid";
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
          await saveData();
          await showMessages(scene, [{ text: "Game has been saved." }]);
          break;
        default:
          exhaustiveGuard(WorldMenuOptionGrid.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel)
      isMenuVisible.value = false;
    else if (isMovingDirection(justDownInput)) WorldMenuOptionGrid.move(justDownInput);

    return true;
  };

  return { isMenuVisible, onPlayerInput };
});
