import type { NuxtConfig } from "nuxt/schema";

export const vuetify: NuxtConfig["vuetify"] = {
  moduleOptions: {
    // https://www.youtube.com/watch?v=aamWg1TuC3o
    disableVuetifyStyles: true,
    styles: {
      configFile: "assets/css/components.scss",
    },
  },
};
