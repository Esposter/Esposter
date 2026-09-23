import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";

export const useToggleTheme = () => {
  const theme = useVTheme();
  const themeCookie = useCookie(THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS);
  // The transition grows from where the pointer pressed, and from the default origin when a key chose it
  return async (event?: PointerEvent) => {
    if (event) theme.setTransitionOrigin(event);
    await theme.cycle();
    themeCookie.value = theme.name.value;
  };
};
