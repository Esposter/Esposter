import { createVuetify, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export enum ThemeMode {
  light = "light",
  dark = "dark",
}

const baseColors = {
  [ThemeMode.light]: {
    background: "#dae0e6",
    surface: "#fff",
    border: "#ccc",
  },
  [ThemeMode.dark]: {
    background: "#18191a",
    surface: "#36393f",
    border: "#ccc",
  },
};

type BaseColors = typeof baseColors[ThemeMode];

const toSixDigitHexColor = (hexColor: string) =>
  hexColor.length === 3 ? hexColor.split("").reduce((acc, curr) => `${acc}${curr}${curr}`, "") : hexColor;

const getBaseColorsExtension = (colors: BaseColors) => {
  const sanitisedColors = Object.entries(colors).reduce<{ [key: string]: string }>((acc, [color, hex]) => {
    acc[color] = `${hex[0]}${toSixDigitHexColor(hex.substring(1))}`;
    return acc;
  }, {}) as BaseColors;
  return {
    surfaceOpacity80: `${sanitisedColors.surface}cc`,
  };
};

const theme: VuetifyOptions["theme"] = {
  themes: {
    [ThemeMode.light]: {
      dark: false,
      colors: {
        ...baseColors[ThemeMode.light],
        ...getBaseColorsExtension(baseColors[ThemeMode.light]),
      },
    },
    [ThemeMode.dark]: {
      dark: true,
      colors: {
        ...baseColors[ThemeMode.dark],
        ...getBaseColorsExtension(baseColors[ThemeMode.dark]),
      },
    },
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({ components, directives, theme, ssr: true });
  nuxtApp.vueApp.use(vuetify);
});
