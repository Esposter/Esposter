import { useTheme } from "vuetify";

// @TODO: Internal vuetify types
type BaseColors = ReturnType<typeof useTheme>["global"]["current"]["value"]["colors"];
type Colors = {
  [Property in keyof BaseColors]: ComputedRef<BaseColors[Property]>;
};

export const useColors = () => {
  const theme = useTheme();
  const colors = Object.keys(theme.global.current.value.colors).reduce<Record<string, ComputedRef<string>>>(
    (acc, color) => {
      acc[color] = computed(() => theme.global.current.value.colors[color]);
      return acc;
    },
    {},
  ) as Colors;
  return colors;
};
