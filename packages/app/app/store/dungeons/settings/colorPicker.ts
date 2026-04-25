import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { ThemeModeSetting, ThemeModeSettings } from "#shared/models/dungeons/data/settings/ThemeModeSetting";
import { useSettingsStore } from "@/store/dungeons/settings";
import { mod } from "@/util/math/mod";
import { takeOne } from "@esposter/shared";
import { Direction } from "grid-engine";

export const useColorPickerStore = defineStore("dungeons/settings/colorPicker", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const themeModeSetting = computed(() => settingsStore.settings[SettingsOption["Theme Mode"]]);
  const setThemeModeSetting = async (value: ThemeModeSetting) => {
    await setSettings(SettingsOption["Theme Mode"], value);
  };
  const updateThemeModeSetting = async (direction: Direction) => {
    const themeModeSettingsArray = [...ThemeModeSettings];
    for (const [index, setting] of themeModeSettingsArray.entries()) {
      if (setting !== themeModeSetting.value) continue;
      if (direction === Direction.LEFT)
        await setThemeModeSetting(takeOne(themeModeSettingsArray, mod(index - 1, themeModeSettingsArray.length)));
      else if (direction === Direction.RIGHT)
        await setThemeModeSetting(takeOne(themeModeSettingsArray, (index + 1) % themeModeSettingsArray.length));
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
