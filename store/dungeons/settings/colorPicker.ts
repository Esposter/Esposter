import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { ThemeModeSetting } from "@/models/dungeons/data/settings/ThemeModeSetting";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { useSettingsStore } from "@/store/dungeons/settings";
import { mod } from "@/util/math/mod";
import { Direction } from "grid-engine";

export const useColorPickerStore = defineStore("dungeons/settings/colorPicker", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const themeModeSetting = computed(() => settings.value[SettingsOption["Theme Mode"]] as ThemeModeSetting);
  const setThemeModeSetting = async (value: ThemeModeSetting) => {
    await setSettings(SettingsOption["Theme Mode"], value);
  };
  const updateThemeModeSetting = async (direction: Direction) => {
    const themeModeSettings = Object.values(ThemeModeSetting);
    for (let i = 0; i < themeModeSettings.length; i++)
      if (themeModeSettings[i] === themeModeSetting.value) {
        if (direction === Direction.LEFT)
          await setThemeModeSetting(themeModeSettings[mod(i - 1, themeModeSettings.length)]);
        else if (direction === Direction.RIGHT)
          await setThemeModeSetting(themeModeSettings[(i + 1) % themeModeSettings.length]);
        return;
      }
  };
  const isUpdateThemeModeSetting = (input: PlayerInput, settingsOption: SettingsOption): input is Direction =>
    settingsOption === SettingsOption["Theme Mode"] && (input === Direction.LEFT || input === Direction.RIGHT);
  return {
    themeModeSetting,
    updateThemeModeSetting,
    isUpdateThemeModeSetting,
  };
});
