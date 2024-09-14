import type { ThemeDefinition, VuetifyOptions } from "vuetify";

import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

import { ThemeMode } from "./models/vuetify/ThemeMode";

// @TODO: Internal vuetify types
export type ThemeColors = NonNullable<ThemeDefinition["colors"]>;
type Theme = VuetifyOptions["theme"];
type Defaults = VuetifyOptions["defaults"];

const BaseColorsCommon = {
  border: "#ccc",
  info: "#2d88ff",
  primary: "#42b883",
} satisfies ThemeColors;

const BaseColorsMap = {
  [ThemeMode.dark]: {
    ...BaseColorsCommon,
    background: "#18191a",
    surface: "#36393f",
    text: "#fff",
  },
  [ThemeMode.light]: {
    ...BaseColorsCommon,
    background: "#dae0e6",
    surface: "#fff",
    text: "#000",
  },
} as const satisfies Record<ThemeMode, ThemeColors>;

type BaseColors = (typeof BaseColorsMap)[ThemeMode];

const toSixDigitHexColor = (hexColor: string) =>
  hexColor.length === 3 ? hexColor.split("").reduce((acc, curr) => `${acc}${curr}${curr}`, "") : hexColor;

const getBaseColorsExtension = (colors: BaseColors) => {
  const sanitisedColors = Object.entries(colors).reduce<Record<string, string>>((acc, [color, hex]) => {
    acc[color] = `${hex[0]}${toSixDigitHexColor(hex.substring(1))}`;
    return acc;
  }, {}) as BaseColors;
  return {
    backgroundOpacity20: `${sanitisedColors.background}33`,
    backgroundOpacity40: `${sanitisedColors.background}66`,
    backgroundOpacity80: `${sanitisedColors.background}cc`,
    infoOpacity10: `${sanitisedColors.info}1a`,
    surfaceOpacity80: `${sanitisedColors.surface}cc`,
  };
};

const theme: Theme = {
  themes: {
    [ThemeMode.dark]: {
      colors: {
        ...BaseColorsMap[ThemeMode.dark],
        ...getBaseColorsExtension(BaseColorsMap[ThemeMode.dark]),
      },
      dark: true,
    },
    [ThemeMode.light]: {
      colors: {
        ...BaseColorsMap[ThemeMode.light],
        ...getBaseColorsExtension(BaseColorsMap[ThemeMode.light]),
      },
      dark: false,
    },
  },
  variations: {
    colors: ["primary"],
    darken: 1,
    lighten: 1,
  },
};

const defaults: Defaults = {
  VAutocomplete: { variant: "outlined" },
  VBtn: { flat: true, style: { backgroundColor: "transparent" } },
  VCombobox: { variant: "outlined" },
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
  VDialog: { maxWidth: "100%", width: 500 },
  VFileInput: { variant: "outlined" },
  VListItem: { active: false },
  VSelect: { variant: "outlined" },
  VTextarea: { variant: "outlined" },
  VTextField: { variant: "outlined" },
  VToolbar: {
    style: {
      backgroundColor: "transparent",
    },
  },
  VToolbarTitle: {
    style: {
      marginInlineStart: 0,
    },
  },
  VTooltip: { location: "top" },
};

export default defineVuetifyConfiguration({ defaults, labComponents: true, theme });
