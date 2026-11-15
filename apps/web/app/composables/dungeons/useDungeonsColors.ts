import type { DungeonsColors } from "#src/models/dungeons/theme/DungeonsColors";

import { ThemeModeColorsMap } from "#src/services/dungeons/scene/settings/ThemeModeColorsMap";
import { useColorPickerStore } from "#src/store/dungeons/settings/colorPicker";

export const useDungeonsColors = (): DungeonsColors => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return {
    border: computed(() => ThemeModeColorsMap[themeModeSetting.value].border),
    primary: computed(() => ThemeModeColorsMap[themeModeSetting.value].primary),
  };
};
