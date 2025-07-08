import type { NuxtConfig } from "nuxt/schema";

import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";

export const typescript: NuxtConfig["typescript"] = {
  sharedTsConfig: {
    compilerOptions: {
      // @TODO: https://github.com/nuxt/nuxt/issues/32556
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
    include: ["../{configuration,scripts}/**/*.ts"],
  },
};
