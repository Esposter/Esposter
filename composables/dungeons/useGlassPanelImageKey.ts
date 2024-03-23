import { ThemeModeGlassPanelImageKeyMap } from "@/services/dungeons/settings/ThemeModeGlassPanelImageKeyMap";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";

export const useGlassPanelImageKey = () => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return computed(() => ThemeModeGlassPanelImageKeyMap[themeModeSetting.value]);
};
