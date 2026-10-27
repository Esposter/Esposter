import type { SinName } from "./constants";

// One fixed slot of the dataviz reference palette per sin, so a sin keeps its colour as its score moves
export const SinColorMap = {
  envy: { dark: "#c98500", light: "#eda100" },
  gluttony: { dark: "#008300", light: "#008300" },
  greed: { dark: "#d95926", light: "#eb6834" },
  lust: { dark: "#d55181", light: "#e87ba4" },
  pride: { dark: "#3987e5", light: "#2a78d6" },
  sloth: { dark: "#9085e9", light: "#6250d6" },
  wrath: { dark: "#199e70", light: "#1baf7a" },
} as const satisfies Record<SinName, { dark: string; light: string }>;
