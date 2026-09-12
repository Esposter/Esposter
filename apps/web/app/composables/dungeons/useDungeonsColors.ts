import type { DungeonsColors } from "@/models/dungeons/theme/DungeonsColors";

import { ThemeModeColorsMap } from "@/services/dungeons/scene/settings/ThemeModeColorsMap";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";

export const useDungeonsColors = (): DungeonsColors => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return {
    border: computed(() => ThemeModeColorsMap[themeModeSetting.value].border),
    primary: computed(() => ThemeModeColorsMap[themeModeSetting.value].primary),
  };
};
