import { ThemeMode } from "@/models/ui/ThemeMode";
import { useThemeModeStore } from "@/store/ui/themeMode";
// Whether the reader's theme is a dark one, for a third-party widget that takes the mode as a flag
export const useIsDark = () => {
  const themeModeStore = useThemeModeStore();
  const { resolvedThemeMode } = storeToRefs(themeModeStore);
  return computed(() => resolvedThemeMode.value === ThemeMode.Dark);
};
