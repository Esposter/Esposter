import type { Colors as BaseColors } from "vuetify/lib/composables/theme.mjs";

type Colors = {
  [P in keyof BaseColors]: ComputedRef<BaseColors[P]>;
};

export const useColors = () => {
  const globalTheme = useGlobalTheme();
  const colors = Object.fromEntries(
    Object.keys(globalTheme.current.value.colors).map((color) => [
      color,
      computed(() => globalTheme.current.value.colors[color]),
    ]),
  ) as Colors;
  return colors;
};
