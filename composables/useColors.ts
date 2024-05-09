// @TODO: Internal vuetify types
type BaseColors = ReturnType<typeof useGlobalTheme>["current"]["value"]["colors"];
type Colors = {
  [P in keyof BaseColors]: ComputedRef<BaseColors[P]>;
};

export const useColors = () => {
  const globalTheme = useGlobalTheme();
  const colors = Object.keys(globalTheme.current.value.colors).reduce<Record<string, ComputedRef<string>>>(
    (acc, color) => {
      acc[color] = computed(() => globalTheme.current.value.colors[color]);
      return acc;
    },
    {},
  ) as Colors;
  return colors;
};
