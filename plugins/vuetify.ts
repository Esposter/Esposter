import { createVuetify, ThemeDefinition, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

type PaletteMode = "light" | "dark";

const baseColors: Record<PaletteMode, ThemeDefinition["colors"]> = {
  light: {
    primary: "#61dbfb",
    background: "#dae0e6",
    surface: "#ffffff",
    border: "#cccccc",
  },
  dark: {
    primary: "#61dbfb",
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
    light: {
      dark: false,
      colors: {
        ...baseColors.light,
        ...getBaseColorsExtension(baseColors.light),
      },
    },
    dark: {
      dark: true,
      colors: {
        ...baseColors.dark,
        ...getBaseColorsExtension(baseColors.dark),
      },
    },
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({ components, directives, theme });
  nuxtApp.vueApp.use(vuetify);
});
