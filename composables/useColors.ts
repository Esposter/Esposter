import { useTheme } from "vuetify";

// @NOTE: Remove this type when vuetify team exposes it
// https://github.com/vuetifyjs/vuetify/issues/16680
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
