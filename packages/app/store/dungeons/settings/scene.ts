import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/scene/settings/InfoContainerTextMap";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { useDungeonsStore } from "@/store/dungeons";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { exhaustiveGuard } from "@esposter/shared";

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const volumeStore = useVolumeStore();
  const { isUpdateVolume, updateVolume } = volumeStore;
  const colorPickerStore = useColorPickerStore();
  const { isUpdateThemeModeSetting, updateThemeModeSetting } = colorPickerStore;
  const selectedSettingsOption = computed(
    () => SettingsOptionGrid.getValue({ x: 0, y: SettingsOptionGrid.position.value.y }) as SettingsOption,
  );
  // We need to do 1 of 2 things when the option grid is updated:
  // 1. If the user has selected the settings option column or moved up or down regardless of keyboard/click/touch
  // i.e. (newX === 0 || newY !== oldY), then we should automatically switch it to the active settings value
  // 2. Otherwise automatically sync settings value with option grid value
  // We unforunately need to watch the properties separately instead of
  // watching the entire position object with deep: true, since oldValue
  // won't update at all unless you replace the entire object everytime
  // you do an update which is way too annoying and not clean code at all :C
  watch(
    [() => SettingsOptionGrid.position.value.y, () => SettingsOptionGrid.position.value.x],
    async ([newY, newX], [oldY]) => {
      if (!(selectedSettingsOption.value in settings.value)) return;

      if (newX === 0 || newY !== oldY) {
        const value = settings.value[selectedSettingsOption.value as keyof typeof settings.value];
        const x = SettingsOptionGrid.getPositionX(value as typeof SettingsOptionGrid.value, newY);
        if (x === null) return;
        // @TODO: This seems to be triggering the watch again... fix this otherwise it calls setSettings too frequently which is annoying
        SettingsOptionGrid.position.value.x = x;
        return;
      }

      await setSettings(
        selectedSettingsOption.value as keyof typeof settings.value,
        SettingsOptionGrid.value as (typeof settings.value)[keyof typeof settings.value],
      );
    },
  );

  const infoText = computed(() => InfoContainerTextMap[selectedSettingsOption.value]);

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
    else SettingsOptionGrid.move(justDownInput, true);
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
