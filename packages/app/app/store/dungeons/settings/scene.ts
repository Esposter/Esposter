import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/scene/settings/InfoContainerTextMap";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useDungeonsStore } from "@/store/dungeons";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { exhaustiveGuard } from "@esposter/shared";
import { Direction } from "grid-engine";

let isAutoUpdateGridX = false;

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const volumeStore = useVolumeStore();
  const { isUpdateVolume, updateVolume } = volumeStore;
  const colorPickerStore = useColorPickerStore();
  const { isUpdateThemeModeSetting, updateThemeModeSetting } = colorPickerStore;
  const selectedSettingsOption = computed(
    () => SettingsOptionGrid.getValue({ x: 0, y: SettingsOptionGrid.position.value.y }) as SettingsOption,
  );
  const infoText = computed(() => InfoContainerTextMap[selectedSettingsOption.value]);
  // We need to do 1 of 2 things when the option grid is updated:
  // 1. If the user has changed position "y" (settings option) regardless of keyboard/click/touch,
  // Then we should automatically switch it to the active settings value
  // 2. If the user has changed position "x" (updated settings value), then we should setSettings (save the game)
  watch(
    () => SettingsOptionGrid.position.value.y,
    (newY) => {
      if (!(selectedSettingsOption.value in settingsStore.settings)) return;

      const value = settingsStore.settings[selectedSettingsOption.value as keyof typeof settingsStore.settings];
      const x = SettingsOptionGrid.getPositionX(value as typeof SettingsOptionGrid.value, newY);
      if (x === undefined) return;

      SettingsOptionGrid.position.value.x = x;
      isAutoUpdateGridX = true;
    },
  );

  watch(
    () => SettingsOptionGrid.position.value.x,
    async () => {
      if (isAutoUpdateGridX) {
        isAutoUpdateGridX = false;
        return;
      } else if (selectedSettingsOption.value === SettingsOption.Close) return;

      await setSettings(
        selectedSettingsOption.value,
        SettingsOptionGrid.value as (typeof settingsStore.settings)[keyof typeof settingsStore.settings],
      );
    },
  );

  const onPlayerInput = async (
    scene: SceneWithPlugins,
    justDownInput: PlayerInput,
    input: PlayerInput,
    delta: number,
  ) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    // Handle special cases first with player direction input
    else if (isUpdateVolume(input, selectedSettingsOption.value)) await updateVolume(input, delta);
    else if (isUpdateThemeModeSetting(justDownInput, selectedSettingsOption.value))
      await updateThemeModeSetting(justDownInput);
    // We ignore validation when moving up/down since we auto update grid x
    // And this is just updating the settings options being viewed, not the actual values
    else SettingsOptionGrid.move(justDownInput, justDownInput === Direction.UP || justDownInput === Direction.DOWN);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
        fadeSwitchToScene(scene, SceneKey.Title);
        return;
      case PlayerSpecialInput.Confirm:
        if (selectedSettingsOption.value === SettingsOption.Close) fadeSwitchToScene(scene, SceneKey.Title);
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  return { infoText, onPlayerInput };
});
