import type { UserConfig } from "vite";

import dts from "unplugin-dts/vite";

import { DISTRIBUTION_DIRECTORY } from "./constants";
import { getExternal } from "./getExternal";
import { getVuePlugins } from "./getVuePlugins";

// Vite rather than bare rolldown for the one package that ships `.vue` files: Vite 8 bundles with rolldown
// Anyway (hence `rolldownOptions`), and it brings the two things rolldown alone can't do — SFC compilation and
// A vue-tsc-backed declaration build. Vite empties `outDir` itself, so no clean plugin here.
export const getViteConfiguration = (): UserConfig => ({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    outDir: DISTRIBUTION_DIRECTORY,
    rolldownOptions: {
      external: getExternal(),
    },
  },
  plugins: [...getVuePlugins(), dts({ tsconfigPath: "tsconfig.build.json" })],
  resolve: {
    tsconfigPaths: true,
  },
});
