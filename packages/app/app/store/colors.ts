import type { Store } from "pinia";
import type { Colors as BaseVuetifyColors } from "vuetify/lib/composables/theme.mjs";

import { takeOne } from "@esposter/shared";

import type { BaseColors, getBaseColorsExtension } from "../../vuetify.config";

type Colors = {
  [P in keyof UnifiedColors]: ComputedRef<UnifiedColors[P]>;
};

type UnifiedColors = BaseColors & BaseVuetifyColors & ReturnType<typeof getBaseColorsExtension>;

const id = "colors";
const useBaseColorsStore = defineStore<typeof id, Colors>(id, () => {
  const globalTheme = useGlobalTheme();
  const colors = Object.fromEntries(
    Object.keys(globalTheme.current.value.colors).map((color) => [
      color,
      computed(() => takeOne(globalTheme.current.value.colors, color)),
    ]),
  ) as Colors;
  return colors;
});

export const useColorsStore = () => useBaseColorsStore() as Store<"colors", Colors>;
