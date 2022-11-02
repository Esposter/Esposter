import { createVuetify, ThemeDefinition, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export enum ThemeMode {
  light = "light",
  dark = "dark",
}

type ThemeColors = NonNullable<ThemeDefinition["colors"]>;

const baseColors: Record<ThemeMode, ThemeColors> = {
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

const convertToSixDigitHexColor = (hexColor: string) =>
  hexColor.length === 3 ? hexColor.split("").reduce((acc, curr) => `${acc}${curr}${curr}`, "") : hexColor;

const getBaseColorsExtension = (colors: ThemeColors) => {
  const sanitisedColors = Object.entries(colors).reduce<ThemeColors>((acc, curr) => {
    acc[curr[0]] = curr[1] ? convertToSixDigitHexColor(curr[1]) : undefined;
    return acc;
  }, {});
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
