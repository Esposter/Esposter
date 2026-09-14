import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { ThemeModeSettings } from "#shared/models/dungeons/data/settings/ThemeModeSetting";
import { useSettingsStore } from "@/store/dungeons/settings";
import { mod } from "@/util/math/mod";
import { takeOne } from "@esposter/shared";
import { Direction } from "grid-engine";

export const useColorPickerStore = defineStore("dungeons/settings/colorPicker", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const themeModeSetting = computed(() => settingsStore.settings[SettingsOption["Theme Mode"]]);
  const updateThemeModeSetting = async (direction: Direction) => {
    const index = ThemeModeSettings.indexOf(themeModeSetting.value);
    if (index === -1) return;
    // The setting list is a ring, so stepping past either end lands on the other
    else if (direction === Direction.LEFT)
      await setSettings(
        SettingsOption["Theme Mode"],
        takeOne(ThemeModeSettings, mod(index - 1, ThemeModeSettings.length)),
      );
    else if (direction === Direction.RIGHT)
      await setSettings(
        SettingsOption["Theme Mode"],
        takeOne(ThemeModeSettings, mod(index + 1, ThemeModeSettings.length)),
      );
  };
  return {
    themeModeSetting,
    updateThemeModeSetting,
  };
});
