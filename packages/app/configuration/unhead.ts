import type { NuxtConfig } from "nuxt/schema";
// @TODO: https://github.com/vuetifyjs/nuxt-module/issues/298
export const unhead: NuxtConfig["unhead"] = {
  legacy: true,
  renderSSRHeadOptions: {
    omitLineBreaks: false,
  },
};
