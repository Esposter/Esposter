import { INITIAL_SETTINGS_POSITION, SETTINGS_POSITION_INCREMENT } from "@/services/dungeons/scene/settings/constants";

export const useSettingsCursorDimensions = (rowIndex: MaybeRefOrGetter<number>) => {
  useSettingsMenuWidth((settingsMenuWidth) => (width.value = settingsMenuWidth - INITIAL_SETTINGS_POSITION.x));
  const width = ref<number>();
  return {
    height: SETTINGS_POSITION_INCREMENT.y - 15,
    origin: 0,
    width,
    x: INITIAL_SETTINGS_POSITION.x / 2,
    y: computed(() => INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * toValue(rowIndex) - 3),
  };
};
