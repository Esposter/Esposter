import type { NuxtConfig } from "nuxt/schema";

export const imports: NuxtConfig["imports"] = {
  dirs: ["composables/**"],
  transform: {
    // https://github.com/rolldown/rolldown/issues/8172#issuecomment-3859313807
    exclude: [/\/vue-phaserjs\//u],
    // @TODO: no upstream issue — @nuxt/content's client api calls a global `$fetch`, which Nuxt 5 no longer sets on
    // The client, auto-importing it instead (https://github.com/nuxt/nuxt/pull/35790), so loading a collection's
    // Database in the browser throws "$fetch is not defined"; the auto-import is extended to that one module
    include: [/\/@nuxt\/content\/dist\/runtime\/internal\/api\.js/u],
  },
};
