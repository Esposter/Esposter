import type { NuxtConfig } from "nuxt/schema";

import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";

export const typescript: NuxtConfig["typescript"] = {
  shim: false,
  tsConfig: {
    exclude: typescriptIgnores.map((i) => (i.startsWith("public") ? `../${i}` : i)),
  },
};
