import { regionDataPlugin } from "#parity/regionDataPlugin";
import { screenNamesPlugin } from "#parity/screenNamesPlugin";
import { gameDataMirrorPlugin } from "#scripts/gameData/mirror/gameDataMirrorPlugin";
import { tresCustomElements } from "#scripts/tres/tresCustomElements";
import { dynamicJsonImportPlugin, getVuePlugins } from "@esposter/configuration";
import { SOURCE_CONDITION } from "@esposter/configuration/constants";
import { dirname, resolve } from "node:path";
import { defaultClientConditions, defineConfig } from "vite";

// A fixture and its reference are the parity page's own, each a lazy chunk of its screen
const PARITY_ONLY_MODULE_REGEX = /\.(?:fixture|reference)\.ts$/u;

// The parity page: the interface screens alone on Vite, without Nuxt, so a screen is up in about a second. Its root is
// The package, so the page and the visual suite glob the screens from `/src` alike. Its siblings are read from their
// Source, as the tests read them, so a change to the engine or the interface library shows without a build. A
// Production Build of the page is what `genshin:parity load` measures: its entry is named here since the root holds no
// `index.html`
export default defineConfig({
  build: {
    rolldownOptions: {
      input: resolve(import.meta.dirname, "index.html"),
      output: {
        // Every component is one chunk, not a chunk each: a lazy component is a dynamic entry of its own, so each one
        // Would be a request on every screen that renders it
        manualChunks: (id) =>
          id.includes("/src/components/") && !PARITY_ONLY_MODULE_REGEX.test(id) ? "components" : undefined,
      },
    },
  },
  plugins: [
    ...getVuePlugins({ customElements: tresCustomElements }),
    dynamicJsonImportPlugin,
    gameDataMirrorPlugin,
    regionDataPlugin,
    screenNamesPlugin,
  ],
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  root: dirname(import.meta.dirname),
  // The shared checkout serves on 3011, and a busy port is taken by the next one up, which the commands find by probing
  // From their first port (`resolveParityPageRoot`). A checkout other than the shared one names its first port through
  // `GENSHIN_PARITY_PORT`, the same variable the commands read
  server: { port: Number(process.env.GENSHIN_PARITY_PORT ?? 3011), strictPort: false },
});
