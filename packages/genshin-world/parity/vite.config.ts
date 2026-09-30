import { getVuePlugins, SOURCE_CONDITION } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { dirname } from "node:path";
import { defaultClientConditions, defineConfig } from "vite";

// The parity page: the interface screens alone on Vite, without Nuxt, so a screen is up in about a second. Its root is
// The package, so the page and the visual suite glob the screens from `/src` alike. Its siblings are read from their
// Source, as the tests read them, so a change to the engine or the interface library shows without a build
export default defineConfig({
  plugins: getVuePlugins(templateCompilerOptions),
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  root: dirname(import.meta.dirname),
});
