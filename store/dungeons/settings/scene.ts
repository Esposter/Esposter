import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSettingsOption } from "@/models/dungeons/settings/PlayerSettingsOption";
import { dayjs } from "@/services/dayjs";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/settings/InfoContainerTextMap";
import { PlayerSettingsOptionGrid } from "@/services/dungeons/settings/PlayerSettingsOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
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
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  const optionGrid = ref(PlayerSettingsOptionGrid);
  const infoText = computed(() => {
    const PlayerSettingsOption = optionGrid.value.getValue({ x: 0, y: optionGrid.value.position.y });
    return InfoContainerTextMap[PlayerSettingsOption as keyof typeof InfoContainerTextMap];
  });

  const onPlayerInput = () => {
    const input = controls.value.getInput(true);
    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    const selectedSettingsOption = optionGrid.value.getValue({
      x: 0,
      y: optionGrid.value.position.y,
    });

    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (optionGrid.value.value === PlayerSettingsOption.Close) {
          switchToTitleScene();
          return;
        }
        // Ignore confirmations on the settings option column
        else if (
          Object.values<string>(PlayerSettingsOption)
            .filter((o) => o !== PlayerSettingsOption.Close)
            .includes(optionGrid.value.value)
        )
          return;

        settings.value[selectedSettingsOption as keyof typeof settings.value] = optionGrid.value.value;
        return;
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
