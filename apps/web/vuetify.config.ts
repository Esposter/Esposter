import type { IconsOptions } from "vuetify-nuxt-module";
import type { DefaultsOptions } from "vuetify/lib/composables/defaults.mjs";
import type { DisplayOptions } from "vuetify/lib/composables/display.mjs";
import type { Colors, ThemeOptions } from "vuetify/lib/composables/theme.mjs";

import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";
import { aliases } from "vuetify/iconsets/mdi";

import type { UiTheme } from "./app/models/ui/UiTheme";

import { UiToken } from "./app/models/ui/UiToken";
import { ThemeMode } from "./app/models/vuetify/ThemeMode";
import { BREAKPOINTS } from "./configuration/breakpoints";
import { ThemeModeUiThemeMap } from "./configuration/ThemeModeUiThemeMap";
import { UiPaletteMap } from "./configuration/UiPaletteMap";
import { EN_US_SEGMENTER } from "./shared/services/intl/constants";

// Every page Vuetify still draws takes the UI library's palette, so the two libraries agree on one page while both are on it
const getBaseColors = (palette: (typeof UiPaletteMap)[UiTheme]) =>
  ({
    background: palette[UiToken.Background],
    border: palette[UiToken.PanelEdge],
    error: palette[UiToken.Error],
    info: palette[UiToken.Info],
    primary: palette[UiToken.Accent],
    success: palette[UiToken.Success],
    surface: palette[UiToken.Panel],
    text: palette[UiToken.Text],
    warning: palette[UiToken.Warning],
  }) satisfies Partial<Colors>;

const ThemeModeBaseColorsMap = {
  [ThemeMode.dark]: getBaseColors(UiPaletteMap[ThemeModeUiThemeMap[ThemeMode.dark]]),
  [ThemeMode.light]: getBaseColors(UiPaletteMap[ThemeModeUiThemeMap[ThemeMode.light]]),
} as const satisfies Partial<Record<ThemeMode, Partial<Colors>>>;

export type BaseColors = (typeof ThemeModeBaseColorsMap)[Exclude<ThemeMode, ThemeMode.system>];

const toSixDigitHexColor = (hexColor: string) =>
  hexColor.length === 3
    ? Array.from(EN_US_SEGMENTER.segment(hexColor), ({ segment }) => segment).reduce(
        (accumulator, digit) => `${accumulator}${digit}${digit}`,
        "",
      )
    : hexColor;

export const getBaseColorsExtension = (colors: BaseColors) => {
  const sanitizedColors = Object.fromEntries(
    Object.entries(colors).map(([color, hex]) => [color, `${hex[0]}${toSixDigitHexColor(hex.slice(1))}`]),
  );
  return {
    "background-opacity-20": `${sanitizedColors.background}33`,
    "background-opacity-40": `${sanitizedColors.background}66`,
    "background-opacity-80": `${sanitizedColors.background}cc`,
    "info-opacity-10": `${sanitizedColors.info}1a`,
    "on-info-opacity-10": colors.text,
    "on-primary-opacity-10": colors.text,
    "primary-opacity-10": `${sanitizedColors.primary}1a`,
    "surface-opacity-80": `${sanitizedColors.surface}cc`,
  };
};

const theme: ThemeOptions = {
  // Vuetify's own implicit default, stated because the client-hints module requires a named one to fall back
  // To on a first request, before it knows the browser's colour scheme
  defaultTheme: ThemeMode.light,
  themes: {
    [ThemeMode.dark]: {
      colors: {
        ...ThemeModeBaseColorsMap[ThemeMode.dark],
        ...getBaseColorsExtension(ThemeModeBaseColorsMap[ThemeMode.dark]),
      },
      dark: true,
    },
    [ThemeMode.light]: {
      colors: {
        ...ThemeModeBaseColorsMap[ThemeMode.light],
        ...getBaseColorsExtension(ThemeModeBaseColorsMap[ThemeMode.light]),
      },
      dark: false,
    },
  },
  variations: { colors: ["primary"], darken: 1, lighten: 1 },
};
// Every input in the app renders its details row only when it has something to say. Vuetify's own default
// Reserves the row unconditionally, which pads every form with a blank line for a message that is usually
// Absent, and the alternative a caller reaches for — `hide-details` — silently swallows the validation error
// A field with rules exists to report. "auto" is the one value that is right for both, so it is stated here
// Once instead of per field
const defaults: DefaultsOptions = {
  VAutocomplete: { hideDetails: "auto", variant: "outlined" },
  VBtn: { flat: true },
  VCheckbox: { hideDetails: "auto" },
  VColorInput: { hideDetails: "auto", variant: "outlined" },
  VCombobox: { hideDetails: "auto", variant: "outlined" },
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
  VFileInput: { hideDetails: "auto", variant: "outlined" },
  VRadioGroup: { hideDetails: "auto" },
  VSelect: { hideDetails: "auto", variant: "outlined" },
  VSlider: { hideDetails: "auto" },
  // One corner for every toast in the app. Vuetify anchors a snackbar bottom centre, which is where the message
  // Composer and the mobile navigation already are, so a notification landed on top of what the reader was
  // Typing into. The one snackbar that overrides this reports where the list is rather than that something
  // Happened, and says so at its own call site
  VSnackbar: { location: "top right" },
  // A switch reports its state by being on, so the grey default reads as disabled. `hideDetails` is `"auto"` here
  // For the same reason it is everywhere else: no row while there is no message, and the message when there is
  VSwitch: { color: "primary", hideDetails: "auto" },
  VTextarea: { hideDetails: "auto", variant: "outlined" },
  VTextField: { hideDetails: "auto", variant: "outlined" },
  VToolbar: { color: "surface" },
  VToolbarTitle: {
    style: {
      // Neutralise Vuetify's default title margin so the padding below is the single source of horizontal spacing
      marginInlineStart: 0,
      paddingLeft: "1rem",
    },
  },
  VTooltip: { location: "top" },
};

// Icons are UnoCSS classes, generated only for the names the source writes. Vuetify's internal icons — a select's
// Arrow, a checkbox's mark — are aliases no source file names, and the module maps only some of them to the
// UnoCSS set, so every alias Vuetify defines is mapped here and `uno.config.ts` safelists the lot
const icons: IconsOptions = {
  defaultSet: "unocss-mdi",
  unocssAdditionalIcons: Object.fromEntries(
    Object.entries(aliases).flatMap(([alias, icon]) =>
      typeof icon === "string" ? [[alias, icon.replace(/^mdi-/u, "i-mdi:")]] : [],
    ),
  ),
};

const display: DisplayOptions = {
  mobileBreakpoint: "md",
  thresholds: BREAKPOINTS,
};

export default defineVuetifyConfiguration({ defaults, display, icons, labComponents: true, theme });
