import { useTheme } from "vuetify";

// @NOTE: Remove this type when vuetify team exposes it
type BaseColors = ReturnType<typeof useTheme>["global"]["current"]["value"]["colors"];
type Colors = {
  [P in keyof BaseColors]: ComputedRef<BaseColors[P]>;
};

export const useColors = () =>
  Object.entries(useTheme().global.current.value.colors).reduce<Record<string, ComputedRef<string>>>(
    (acc, [color, hex]) => {
      acc[color] = computed(() => hex);
      return acc;
    },
    {}
  ) as Colors;
