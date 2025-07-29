import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";
import { useTheme } from "vuetify";

export const useToggleTheme = () => {
  const theme = useTheme();
  const themeCookie = useCookie(THEME_COOKIE_NAME);
  const isDark = useIsDark();
  const newThemeValue = computed(() => (isDark.value ? ThemeMode.light : ThemeMode.dark));
  return () => {
    themeCookie.value = newThemeValue.value;
    theme.change(themeCookie.value);
  };
};
