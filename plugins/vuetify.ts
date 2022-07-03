import { createVuetify, ThemeDefinition } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#2b5876",
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      themes: {
        light,
      },
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
