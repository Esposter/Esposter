import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { MenuOption } from "@/models/dungeons/world/MenuOption";
import { isMovingDirection } from "@/services/dungeons/input/isMovingDirection";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useMenuStore = defineStore("dungeons/world/menu", () => {
  const phaserStore = usePhaserStore();
  const { sceneKey } = storeToRefs(phaserStore);
  const gameStore = useGameStore();
  const { saveData, fadeSwitchToScene } = gameStore;
  const worldSceneStore = useWorldSceneStore();
  const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const { launchScene } = usePreviousScene(sceneKey.value);

  const onPlayerInput = async (justDownInput: PlayerInput) => {
    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (menuOptionGrid.value.value) {
        case MenuOption.Monsters:
          launchScene(SceneKey.MonsterParty);
          return;
        case MenuOption.Inventory:
          launchScene(SceneKey.Inventory);
          return;
        case MenuOption.Save:
          await saveData();
          showMessages([{ text: "Game has been saved." }]);
          return;
        case MenuOption.Exit:
          isMenuVisible.value = false;
          fadeSwitchToScene(SceneKey.Title);
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
