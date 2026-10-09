import { dynamicJsonImportPlugin } from "#parity/dynamicJsonImportPlugin";
import { gameDataMirrorPlugin } from "#scripts/gameData/mirror/gameDataMirrorPlugin";
import { getVuePlugins, SOURCE_CONDITION } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { dirname } from "node:path";
import { defaultClientConditions, defineConfig } from "vite";

// The parity page: the interface screens alone on Vite, without Nuxt, so a screen is up in about a second. Its root is
// The package, so the page and the visual suite glob the screens from `/src` alike. Its siblings are read from their
// Source, as the tests read them, so a change to the engine or the interface library shows without a build
export default defineConfig({
  plugins: [...getVuePlugins(templateCompilerOptions), dynamicJsonImportPlugin, gameDataMirrorPlugin],
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  root: dirname(import.meta.dirname),
  // A checkout other than the shared one serves on its own port through `GENSHIN_PARITY_PORT`
  server: { port: Number(process.env.GENSHIN_PARITY_PORT ?? 3002), strictPort: true },
});
