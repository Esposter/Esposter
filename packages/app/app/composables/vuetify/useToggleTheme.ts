import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";

export const useToggleTheme = () => {
  const theme = useVTheme();
  const themeCookie = useCookie(THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS);
  return async (event: PointerEvent) => {
    theme.setTransitionOrigin(event);
    await theme.cycle();
    themeCookie.value = theme.name.value;
  };
};
