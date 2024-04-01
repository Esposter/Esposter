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

export const useWorldMenuStore = defineStore("dungeons/world/menu", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const { launchParallelScene } = phaserStore;
  const gameStore = useGameStore();
  const { saveData, fadeSwitchToScene } = gameStore;
  const worldSceneStore = useWorldSceneStore();
  const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const onPlayerInput = async (input: PlayerInput) => {
    if (input === PlayerSpecialInput.Confirm)
      switch (menuOptionGrid.value.value) {
        case MenuOption.Monsters:
          scene.value.scene.pause();
          launchParallelScene(SceneKey.MonsterParty);
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
    else if (input === PlayerSpecialInput.Enter || input === PlayerSpecialInput.Cancel) isMenuVisible.value = false;
    else if (isMovingDirection(input)) menuOptionGrid.value.move(input);
  };
  return { onPlayerInput };
});
