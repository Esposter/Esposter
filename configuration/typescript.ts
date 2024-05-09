import type { NuxtConfig } from "nuxt/schema";
import typescriptIgnores from "../eslint/typescriptIgnores";

export const typescript: NuxtConfig["typescript"] = {
  shim: false,
  tsConfig: {
    exclude: typescriptIgnores.map((i) => (i.startsWith("public") ? `../${i}` : i)),
  },
};
