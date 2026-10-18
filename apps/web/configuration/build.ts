import type { NuxtConfig } from "nuxt/schema";

export const build: NuxtConfig["build"] = {
  // The dependency score's `nuxt analyze` run names the raw-data report its bundle column reads; any other run keeps the
  // Treemap the analyze command serves, which a raw-data report leaves it without
  ...(process.env.CLIENT_BUNDLE_REPORT_PATH && {
    analyze: { filename: process.env.CLIENT_BUNDLE_REPORT_PATH, template: "raw-data" },
  }),
  transpile: [
    // Declares "type": "module" over a UMD main, so node's own import of it finds no default export
    "@panzoom/panzoom",
    "@vuetify/v0",
    "survey-creator-vue",
  ],
};
