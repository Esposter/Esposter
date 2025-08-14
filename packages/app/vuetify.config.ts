import type { DefaultsOptions } from "vuetify/lib/composables/defaults.mjs";
import type { Colors, ThemeOptions } from "vuetify/lib/composables/theme.mjs";

import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

import { ThemeMode } from "./app/models/vuetify/ThemeMode";
import { EN_US_SEGMENTER } from "./app/services/shared/constants";

const BaseColorsCommon = {
  border: "#ccc",
  info: "#2d88ff",
  primary: "#42b883",
} as const satisfies Partial<Colors>;

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
} as const satisfies Record<ThemeMode, Partial<Colors>>;

type BaseColors = (typeof BaseColorsMap)[ThemeMode];

const toSixDigitHexColor = (hexColor: string) =>
  hexColor.length === 3
    ? [...EN_US_SEGMENTER.segment(hexColor)].map((s) => s.segment).reduce((acc, curr) => `${acc}${curr}${curr}`, "")
    : hexColor;

const getBaseColorsExtension = (colors: BaseColors) => {
  const sanitisedColors = Object.entries(colors).reduce<Record<string, string>>((acc, [color, hex]) => {
    acc[color] = `${hex[0]}${toSixDigitHexColor(hex.slice(1))}`;
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

const theme: ThemeOptions = {
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

const defaults: DefaultsOptions = {
  VAutocomplete: { variant: "outlined" },
  VBtn: {
    flat: true,
    style: {
      backgroundColor: "transparent",
    },
  },
  VColorInput: { variant: "outlined" },
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
