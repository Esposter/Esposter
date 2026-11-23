import { ThemeModeGlassPanelFileKeyMap } from "#src/services/dungeons/scene/settings/ThemeModeGlassPanelFileKeyMap";
import { useColorPickerStore } from "#src/store/dungeons/settings/colorPicker";

export const useGlassPanelFileKey = () => {
  const colorPickerStore = useColorPickerStore();
  const { themeModeSetting } = storeToRefs(colorPickerStore);
  return computed(() => ThemeModeGlassPanelFileKeyMap[themeModeSetting.value]);
};
