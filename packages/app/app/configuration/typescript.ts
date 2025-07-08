import type { NuxtConfig } from "nuxt/schema";

import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";

export const typescript: NuxtConfig["typescript"] = {
  // @TODO: Remove this when issue is resolved
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
