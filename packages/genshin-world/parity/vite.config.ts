import { regionDataPlugin } from "#parity/regionDataPlugin";
import { gameDataMirrorPlugin } from "#scripts/gameData/mirror/gameDataMirrorPlugin";
import { dynamicJsonImportPlugin, getVuePlugins, SOURCE_CONDITION } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { dirname, resolve } from "node:path";
import { defaultClientConditions, defineConfig } from "vite";

// The parity page: the interface screens alone on Vite, without Nuxt, so a screen is up in about a second. Its root is
// The package, so the page and the visual suite glob the screens from `/src` alike. Its siblings are read from their
// Source, as the tests read them, so a change to the engine or the interface library shows without a build. A production
// Build of the page is what `genshin:parity load` measures: its entry is named here since the root holds no `index.html`
export default defineConfig({
  build: { rolldownOptions: { input: resolve(import.meta.dirname, "index.html") } },
  plugins: [...getVuePlugins(templateCompilerOptions), dynamicJsonImportPlugin, gameDataMirrorPlugin, regionDataPlugin],
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  root: dirname(import.meta.dirname),
  // A checkout other than the shared one serves on its own port through `GENSHIN_PARITY_PORT`
  server: { port: Number(process.env.GENSHIN_PARITY_PORT ?? 3002), strictPort: true },
});
