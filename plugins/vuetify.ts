import { createVuetify, ThemeDefinition, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export enum ThemeMode {
  light = "light",
  dark = "dark",
}

type ThemeColors = NonNullable<ThemeDefinition["colors"]>;

const baseColorsCommon = {
  primary: "#42b883",
  border: "#ccc",
  info: "#2d88ff",
} satisfies ThemeColors;

const baseColors = {
  [ThemeMode.light]: {
    ...baseColorsCommon,
    background: "#dae0e6",
    surface: "#fff",
  },
  [ThemeMode.dark]: {
    ...baseColorsCommon,
    background: "#18191a",
    surface: "#36393f",
  },
} satisfies Record<ThemeMode, ThemeColors>;

type BaseColors = (typeof baseColors)[ThemeMode];

const toSixDigitHexColor = (hexColor: string) =>
  hexColor.length === 3 ? hexColor.split("").reduce((acc, curr) => `${acc}${curr}${curr}`, "") : hexColor;

const getBaseColorsExtension = (colors: BaseColors) => {
  const sanitisedColors = Object.entries(colors).reduce<Record<string, string>>((acc, [color, hex]) => {
    acc[color] = `${hex[0]}${toSixDigitHexColor(hex.substring(1))}`;
    return acc;
  }, {}) as BaseColors;
  return {
    surfaceOpacity80: `${sanitisedColors.surface}cc`,
    infoOpacity10: `${sanitisedColors.info}1a`,
  };
};

const theme: VuetifyOptions["theme"] = {
  variations: {
    colors: ["primary"],
    lighten: 1,
    darken: 1,
  },
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
  const vuetify = createVuetify({
    components,
    directives,
    theme,
    ssr: true,
    defaults: { VBtn: { flat: true } },
  });
  nuxtApp.vueApp.use(vuetify);
});
