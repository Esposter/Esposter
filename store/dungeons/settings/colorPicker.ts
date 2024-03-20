import { MenuColorSetting } from "@/models/dungeons/data/settings/MenuColorSetting";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { useSettingsStore } from "@/store/dungeons/settings";
import { mod } from "@/util/math/mod";
import { Direction } from "grid-engine";

export const useColorPickerStore = defineStore("dungeons/settings/colorPicker", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const menuColor = computed(() => settings.value[SettingsOption["Menu Color"]] as MenuColorSetting);
  const setMenuColor = async (value: MenuColorSetting) => {
    await setSettings(SettingsOption["Menu Color"], value);
  };
  const updateMenuColor = async (direction: Direction) => {
    const menuColors = Object.values(MenuColorSetting);
    for (let i = 0; i < menuColors.length; i++)
      if (menuColors[i] === menuColor.value) {
        if (direction === Direction.LEFT) await setMenuColor(menuColors[mod(i - 1, menuColors.length)]);
        else if (direction === Direction.RIGHT) await setMenuColor(menuColors[(i + 1) % menuColors.length]);
        return;
      }
  };
  const isUpdateMenuColor = (input: PlayerInput, settingsOption: SettingsOption): input is Direction =>
    settingsOption === SettingsOption["Menu Color"] && (input === Direction.LEFT || input === Direction.RIGHT);
  return {
    menuColor,
    updateMenuColor,
    isUpdateMenuColor,
  };
});
