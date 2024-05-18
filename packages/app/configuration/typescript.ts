import typescriptIgnores from "@esposter/eslint/typescriptIgnores";
import type { NuxtConfig } from "nuxt/schema";

export const typescript: NuxtConfig["typescript"] = {
  shim: false,
  tsConfig: {
    exclude: typescriptIgnores.map((i) => (i.startsWith("public") ? `../${i}` : i)),
  },
};
