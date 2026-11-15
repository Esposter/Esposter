import { ThemeModeGlassPanelImageKeyMap } from "#src/services/dungeons/scene/settings/ThemeModeGlassPanelImageKeyMap";
import { useColorPickerStore } from "#src/store/dungeons/settings/colorPicker";

export const useGlassPanelImageKey = () => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return computed(() => ThemeModeGlassPanelImageKeyMap[themeModeSetting.value]);
};
