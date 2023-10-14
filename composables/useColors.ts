import type { Colors } from "@/vuetify.config";
import { useTheme } from "vuetify";

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
