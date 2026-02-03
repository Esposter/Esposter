import type { NuxtConfig } from "nuxt/schema";

import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";

export const typescript: NuxtConfig["typescript"] = {
  tsConfig: {
    exclude: typescriptIgnores.map((i) => `../${i}`),
  },
};
