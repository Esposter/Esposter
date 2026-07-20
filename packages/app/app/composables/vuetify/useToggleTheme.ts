import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

export const useToggleTheme = () => {
  const theme = useVTheme();
  const themeCookie = useCookie(THEME_COOKIE_NAME);
  return async (event: MouseEvent) => {
    theme.setTransitionOrigin(event instanceof window.PointerEvent ? event : null);
    await theme.cycle();
    themeCookie.value = theme.name.value;
  };
};
