import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { MenuColorOption } from "@/models/dungeons/settings/MenuColorOption";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { useSettingsStore } from "@/store/dungeons/settings";
import { mod } from "@/util/math/mod";
import { Direction } from "grid-engine";

export const useColorPickerStore = defineStore("dungeons/settings/colorPicker", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const menuColor = computed(() => settings.value[SettingsOption["Menu Color"]] as MenuColorOption);
  const setMenuColor = (value: MenuColorOption) => {
    setSettings(SettingsOption["Menu Color"], value);
  };
  const updateMenuColor = (direction: Direction) => {
    const menuColors = Object.values(MenuColorOption);
    for (let i = 0; i < menuColors.length; i++)
      if (menuColors[i] === menuColor.value) {
        if (direction === Direction.LEFT) setMenuColor(menuColors[mod(i - 1, menuColors.length)]);
        else if (direction === Direction.RIGHT) setMenuColor(menuColors[(i + 1) % menuColors.length]);
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
