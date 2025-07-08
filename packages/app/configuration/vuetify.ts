import type { ModuleOptions } from "vuetify-nuxt-module";

export const vuetify: ModuleOptions = {
  moduleOptions: {
    // https://www.youtube.com/watch?v=aamWg1TuC3o
    disableVuetifyStyles: true,
    styles: {
      configFile: "assets/css/components.scss",
    },
  },
};
