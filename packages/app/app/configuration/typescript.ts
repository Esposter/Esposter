import type { NuxtConfig } from "nuxt/schema";

import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";

export const typescript: NuxtConfig["typescript"] = {
  // @TODO: https://github.com/nuxt/nuxt/issues/32556
  sharedTsConfig: {
    compilerOptions: {
      paths: {
        "#shared": ["../shared"],
        "#shared/*": ["../shared/*"],
      },
    },
  },
  tsConfig: {
    compilerOptions: {
      noUncheckedIndexedAccess: false,
    },
    exclude: typescriptIgnores.map((i) => `../${i}`),
  },
};
