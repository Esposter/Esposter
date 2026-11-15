import type { UiCommand } from "#src/models/ui/UiCommand";

import { ThemeModes } from "#src/models/ui/ThemeMode";
import { THEME_COMMAND_GROUP } from "#src/services/app/constants";
import { ThemeModeIconMeaningMap } from "#src/services/ui/ThemeModeIconMeaningMap";
import { ThemeModeTitleMap } from "#src/services/ui/ThemeModeTitleMap";
import { useThemeModeStore } from "#src/store/ui/themeMode";

// The theme modes, which the dock's theme menu lists and the palette offers by name: a choice, so every mode is
// Listed with the chosen one marked
export const useThemeModeCommands = () => {
  const themeModeStore = useThemeModeStore();
  const { themeMode } = storeToRefs(themeModeStore);
  return computed<UiCommand[]>(() =>
    ThemeModes.map((mode) => ({
      group: THEME_COMMAND_GROUP,
      id: `${THEME_COMMAND_GROUP}${mode}`,
      isSelected: mode === themeMode.value,
      meaning: ThemeModeIconMeaningMap[mode],
      run: () => {
        themeMode.value = mode;
      },
      title: ThemeModeTitleMap[mode],
    })),
  );
};
