import type { Colors } from "@/models/colors/Colors";

import { takeOne } from "@esposter/shared";

// One computed per theme colour, so a component reads the colour it wants without re-deriving the whole palette
// On every theme change. `Object.fromEntries` cannot carry the key union across, so the shape is stated once here
export const useColorsStore = defineStore("colors", () => {
  const { global } = useVTheme();
  return Object.fromEntries(
    Object.keys(global.current.value.colors).map((color) => [
      color,
      computed(() => takeOne(global.current.value.colors, color)),
    ]),
  ) as Colors;
});
