import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { MenuOption } from "@/models/dungeons/scene/world/MenuOption";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useMenuStore = defineStore("dungeons/world/menu", () => {
  const gameStore = useGameStore();
  const { saveData, fadeSwitchToScene } = gameStore;
  const worldSceneStore = useWorldSceneStore();
  const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;

  const onPlayerInput = async (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    const { launchScene } = usePreviousScene(scene.scene.key);

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (menuOptionGrid.value.value) {
        case MenuOption.Monsters:
          launchScene(scene, SceneKey.MonsterParty);
          return;
        case MenuOption.Inventory:
          launchScene(scene, SceneKey.Inventory);
          return;
        case MenuOption.Save:
          await saveData();
          showMessages(scene, [{ text: "Game has been saved." }]);
          return;
        case MenuOption.Exit:
          isMenuVisible.value = false;
          fadeSwitchToScene(scene, SceneKey.Title);
          return;
        default:
          exhaustiveGuard(menuOptionGrid.value.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel)
      isMenuVisible.value = false;
    else if (isMovingDirection(justDownInput)) menuOptionGrid.value.move(justDownInput);
  };

  return { onPlayerInput };
});
