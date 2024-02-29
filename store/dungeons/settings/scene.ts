import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { dayjs } from "@/services/dayjs";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/settings/InfoContainerTextMap";
import { SettingsOptionGrid } from "@/services/dungeons/settings/SettingsOptionGrid";
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
  const optionGrid = ref(SettingsOptionGrid);
  // We need to do 2 things when the option grid is updated:
  // 1. If the user has selected the settings option column or moved up or down regardless of keyboard/click/touch
  // i.e. (newX === 0 || newY !== oldY), then we should automatically switch it to the active settings value
  // 2. Automatically sync settings value with option grid value
  // We unforunately need to watch the properties separately instead of
  // watching the entire position object with deep: true, since oldValue
  // won't update at all unless you replace the entire object everytime
  // you do an update which is way too annoying and not clean code at all :C
  watch([() => optionGrid.value.position.y, () => optionGrid.value.position.x], ([newY, newX], [oldY]) => {
    const selectedSettingsOption = optionGrid.value.getValue({ x: 0, y: newY });
    if (!(selectedSettingsOption in settings.value)) return;

    if (newX === 0 || newY !== oldY) {
      const value = settings.value[selectedSettingsOption as keyof typeof settings.value] as string;
      const x = optionGrid.value.getPositionX(value, newY);
      if (x === null) return;

      optionGrid.value.position.x = x;
      return;
    }

    settings.value[selectedSettingsOption as keyof typeof settings.value] = optionGrid.value.value;
  });

  const infoText = computed(() => {
    const selectedSettingsOption = optionGrid.value.getValue({ x: 0, y: optionGrid.value.position.y });
    return InfoContainerTextMap[selectedSettingsOption as keyof typeof InfoContainerTextMap];
  });

  const onPlayerInput = () => {
    const input = controls.value.getInput(true);
    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm: {
        const selectedSettingsOption = optionGrid.value.getValue({ x: 0, y: optionGrid.value.position.y });
        if (selectedSettingsOption === SettingsOption.Close) switchToTitleScene();
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
