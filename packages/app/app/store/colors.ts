import type { Colors } from "@/models/colors/Colors";
import type { Store } from "pinia";

import { takeOne } from "@esposter/shared";

const id = "colors";
const useBaseColorsStore = defineStore<typeof id, Colors>(id, () => {
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
