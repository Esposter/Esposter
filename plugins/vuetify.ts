import { createVuetify, ThemeDefinition, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export enum ThemeMode {
  light = "light",
  dark = "dark",
}

const baseColors: Record<ThemeMode, ThemeDefinition["colors"]> = {
  [ThemeMode.light]: {
    background: "#dae0e6",
    surface: "#ffffff",
    border: "#cccccc",
  },
  [ThemeMode.dark]: {
    background: "#18191a",
    surface: "#36393f",
    border: "#cccccc",
  },
};

const getBaseColorsExtension = (colors: ThemeDefinition["colors"]) => ({
  surfaceOpacity80: `${colors?.surface}cc`,
});

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
