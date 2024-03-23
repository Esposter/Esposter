import type { Theme } from "@/models/dungeons/theme/Theme";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { ThemeModeColorsMap } from "~/services/dungeons/settings/ThemeModeColorsMap";

type DungeonsColors = {
  [P in keyof Theme]: ComputedRef<Theme[P]>;
};

export const useDungeonsColors = (): DungeonsColors => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return {
    primary: computed(() => ThemeModeColorsMap[themeModeSetting.value].primary),
    border: computed(() => ThemeModeColorsMap[themeModeSetting.value].border),
  };
};
