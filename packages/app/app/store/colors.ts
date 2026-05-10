import type { Colors } from "@/models/colors/Colors";
import type { Store } from "pinia";

import { takeOne } from "@esposter/shared";

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
