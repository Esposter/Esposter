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
    for (const [index, setting] of ThemeModeSettings.entries()) {
      if (setting !== themeModeSetting.value) continue;
      if (direction === Direction.LEFT)
        await setThemeModeSetting(takeOne(ThemeModeSettings, mod(index - 1, ThemeModeSettings.length)));
      else if (direction === Direction.RIGHT)
        await setThemeModeSetting(takeOne(ThemeModeSettings, (index + 1) % ThemeModeSettings.length));
      return;
    }
  };
  return {
    themeModeSetting,
    updateThemeModeSetting,
  };
});
