import type { Colors as BaseColors } from "vuetify/lib/composables/theme.mjs";

type Colors = {
  [P in keyof BaseColors]: ComputedRef<BaseColors[P]>;
};

export const useColors = () => {
  const globalTheme = useGlobalTheme();
  const colors = Object.keys(globalTheme.current.value.colors).reduce((acc, color) => {
    acc[color] = computed(() => globalTheme.current.value.colors[color]);
    return acc;
  }, {} as Colors);
  return colors;
};
