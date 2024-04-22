import { INITIAL_SETTINGS_POSITION, SETTINGS_POSITION_INCREMENT } from "@/services/dungeons/scene/settings/constants";
import { computed } from "vue";

export const useSettingsCursorDimensions = (rowIndex: MaybeRefOrGetter<number>) => {
  const settingsMenuWidth = useSettingsMenuWidth();
  return computed(() => ({
    x: INITIAL_SETTINGS_POSITION.x / 2,
    y: INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * toValue(rowIndex) - 3,
    origin: 0,
    width: settingsMenuWidth.value - INITIAL_SETTINGS_POSITION.x,
    height: SETTINGS_POSITION_INCREMENT.y - 15,
  }));
};
