import type { UiCommand } from "@/models/ui/UiCommand";

import { ThemeModes } from "@/models/ui/ThemeMode";
import { THEME_COMMAND_GROUP } from "@/services/app/constants";
import { ThemeModeIconMeaningMap } from "@/services/ui/ThemeModeIconMeaningMap";
import { ThemeModeTitleMap } from "@/services/ui/ThemeModeTitleMap";
import { useThemeModeStore } from "@/store/ui/themeMode";

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
