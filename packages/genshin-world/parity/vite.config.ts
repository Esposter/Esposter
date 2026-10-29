import { regionDataPlugin } from "#parity/regionDataPlugin";
import { terrainWorkerAlias } from "#parity/terrainWorkerAlias";
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
  resolve: { alias: terrainWorkerAlias, conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  root: dirname(import.meta.dirname),
  // The shared checkout serves on 3011, and a busy port is taken by the next one up, which the commands find by probing
  // From their first port (`resolveParityPageRoot`). A checkout other than the shared one names its first port through
  // `GENSHIN_PARITY_PORT`, the same variable the commands read
  server: { port: Number(process.env.GENSHIN_PARITY_PORT ?? 3011), strictPort: false },
});
