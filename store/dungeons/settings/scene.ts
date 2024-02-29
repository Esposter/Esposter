import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSettingsMenuOption } from "@/models/dungeons/settings/menu/PlayerSettingsMenuOption";
import { dayjs } from "@/services/dayjs";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/settings/menu/InfoContainerTextMap";
import { PlayerSettingsMenuOptionGrid } from "@/services/dungeons/settings/menu/PlayerSettingsMenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";
import { Cameras } from "phaser";

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const { scene } = storeToRefs(phaserStore);
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;
  const gameStore = useGameStore();
  const { controls } = storeToRefs(gameStore);
  const optionGrid = ref(PlayerSettingsMenuOptionGrid);
  const infoText = computed(() => {
    const playerSettingsMenuOption = optionGrid.value.getValue({ x: 0, y: optionGrid.value.position.y });
    if (playerSettingsMenuOption in InfoContainerTextMap)
      return InfoContainerTextMap[playerSettingsMenuOption as keyof typeof InfoContainerTextMap];
    else return "";
  });

  const onPlayerInput = () => {
    const input = controls.value.getInput(true);
    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        switch (optionGrid.value.value) {
          case PlayerSettingsMenuOption.Close:
            switchToTitleScene();
            return;
          default:
            return;
        }
      case PlayerSpecialInput.Cancel:
        switchToTitleScene();
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  const switchToTitleScene = () => {
    fadeOut(dayjs.duration(0.5, "seconds").asMilliseconds());
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      switchToScene(SceneKey.Title);
    });
  };

  return { optionGrid, infoText, onPlayerInput };
});
