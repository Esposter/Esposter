import type { ThemeDefinition, VuetifyOptions } from "vuetify";
import type { ExternalVuetifyOptions } from "vuetify-nuxt-module";
import { ThemeMode } from "./models/vuetify/ThemeMode";

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
    backgroundOpacity40: `${sanitisedColors.background}66`,
    backgroundOpacity80: `${sanitisedColors.background}cc`,
    surfaceOpacity80: `${sanitisedColors.surface}cc`,
    infoOpacity10: `${sanitisedColors.info}1a`,
  };
};

// @TODO: Fix this type when vuetify team exposes it
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

const defaults: VuetifyOptions["defaults"] = {
  VAutocomplete: { variant: "outlined" },
  VBtn: { style: { backgroundColor: "transparent" }, flat: true },
  VDataTable: {
    style: {
      borderRadius: ".25rem",
    },
    VToolbar: {
      style: {
        borderRadius: ".25rem",
      },
    },
  },
  VDialog: { width: 500, maxWidth: "100%" },
  VSelect: { variant: "outlined" },
  VTextarea: { variant: "outlined" },
  VTextField: { variant: "outlined" },
  VTooltip: { location: "top" },
};

export default {
  theme,
  defaults,
  labComponents: ["VDataTable"],
} satisfies ExternalVuetifyOptions;
