import { getVuePlugins } from "@esposter/configuration";
import { dirname } from "node:path";
import { defineConfig } from "vite";

// The parity page: the interface screens alone on Vite, without Nuxt, so a screen is up in about a second. Its root is
// The package, so the page and the visual suite glob the screens from `/src` alike
export default defineConfig({ plugins: getVuePlugins(), root: dirname(import.meta.dirname) });
