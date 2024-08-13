import type { Theme } from "@/models/dungeons/theme/Theme";

import { ThemeModeColorsMap } from "@/services/dungeons/scene/settings/ThemeModeColorsMap";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";

type DungeonsColors = {
  [P in keyof Theme]: ComputedRef<Theme[P]>;
};

export const useDungeonsColors = (): DungeonsColors => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return {
    border: computed(() => ThemeModeColorsMap[themeModeSetting.value].border),
    primary: computed(() => ThemeModeColorsMap[themeModeSetting.value].primary),
  };
};
