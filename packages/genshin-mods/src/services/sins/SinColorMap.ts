import { SinName } from "../../models/SinName";

// One fixed slot of the dataviz reference palette per sin, so a sin keeps its colour as its score moves
export const SinColorMap: Record<SinName, { dark: string; light: string }> = {
  [SinName.Envy]: { dark: "#c98500", light: "#eda100" },
  [SinName.Gluttony]: { dark: "#008300", light: "#008300" },
  [SinName.Greed]: { dark: "#d95926", light: "#eb6834" },
  [SinName.Lust]: { dark: "#d55181", light: "#e87ba4" },
  [SinName.Pride]: { dark: "#3987e5", light: "#2a78d6" },
  [SinName.Sloth]: { dark: "#9085e9", light: "#6250d6" },
  [SinName.Wrath]: { dark: "#199e70", light: "#1baf7a" },
};
