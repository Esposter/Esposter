import { ThemeModeGlassPanelFileKeyMap } from "@/services/dungeons/scene/settings/ThemeModeGlassPanelFileKeyMap";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";

export const useGlassPanelImageKey = () => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return computed(() => ThemeModeGlassPanelFileKeyMap[themeModeSetting.value]);
};
