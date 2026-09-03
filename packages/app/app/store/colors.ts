import type { Colors } from "@/models/colors/Colors";
import type { Store } from "pinia";

import { takeOne } from "@esposter/shared";

const COLORS_STORE_ID = "colors";
const useBaseColorsStore = defineStore<typeof COLORS_STORE_ID, Colors>(COLORS_STORE_ID, () => {
  const { global } = useVTheme();
  const colors = Object.fromEntries(
    Object.keys(global.current.value.colors).map((color) => [
      color,
      computed(() => takeOne(global.current.value.colors, color)),
    ]),
  ) as Colors;
  return colors;
});

export const useColorsStore = () => useBaseColorsStore() as Store<"colors", Colors>;
