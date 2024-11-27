import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { ThemeModeSetting } from "@/shared/models/dungeons/data/settings/ThemeModeSetting";
import { useSettingsStore } from "@/store/dungeons/settings";
import { mod } from "@/util/math/mod";
import { Direction } from "grid-engine";

export const useColorPickerStore = defineStore("dungeons/settings/colorPicker", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const themeModeSetting = computed(() => settingsStore.settings[SettingsOption["Theme Mode"]]);
  const setThemeModeSetting = async (value: ThemeModeSetting) => {
    await setSettings(SettingsOption["Theme Mode"], value);
  };
  const updateThemeModeSetting = async (direction: Direction) => {
    const themeModeSettings = Object.values(ThemeModeSetting);
    for (const [index, setting] of themeModeSettings.entries())
      if (setting === themeModeSetting.value) {
        if (direction === Direction.LEFT)
          await setThemeModeSetting(themeModeSettings[mod(index - 1, themeModeSettings.length)]);
        else if (direction === Direction.RIGHT)
          await setThemeModeSetting(themeModeSettings[(index + 1) % themeModeSettings.length]);
        return;
      }
  };
  const isUpdateThemeModeSetting = (input: PlayerInput, settingsOption: SettingsOption) =>
    settingsOption === SettingsOption["Theme Mode"] && (input === Direction.LEFT || input === Direction.RIGHT);
  return {
    isUpdateThemeModeSetting,
    themeModeSetting,
    updateThemeModeSetting,
  };
});
