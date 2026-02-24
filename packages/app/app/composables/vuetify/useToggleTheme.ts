import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";
import { takeOne } from "@esposter/shared";
import { useTheme } from "vuetify";

const themeModes = Object.values(ThemeMode);

export const useToggleTheme = () => {
  const theme = useTheme();
  const themeCookie = useCookie(THEME_COOKIE_NAME);
  const newThemeValue = computed(() => {
    const currentIndex = themeModes.indexOf(theme.global.name.value as ThemeMode);
    return takeOne(themeModes, (currentIndex + 1) % themeModes.length);
  });
  return () => {
    themeCookie.value = newThemeValue.value;
    theme.change(newThemeValue.value);
  };
};
