import { createVuetify, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const theme: VuetifyOptions["theme"] = {
  themes: {
    light: {
      dark: false,
      colors: {
        primary: "#61dbfb",
        background: "#dae0e6",
        border: "#ccc",
      },
    },
    dark: {
      dark: true,
      colors: {
        primary: "#61dbfb",
        background: "#18191a",
        surface: "#36393f",
        border: "#ccc",
      },
    },
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({ components, directives, theme });
  nuxtApp.vueApp.use(vuetify);
});
