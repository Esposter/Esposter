import type { NuxtConfig } from "nuxt/schema";

export const imports: NuxtConfig["imports"] = {
  dirs: ["composables/**"],
  // @TODO: Remove once vuetify-nuxt-module imports `useRules` from a module whose `RuleAliases` is augmentable.
  // The module auto-imports it from the `vuetify` root, whose bundled types keep `RuleAliases` unexported, so the
  // `app/types/vuetify.d.ts` augmentation cannot reach it and every alias reads as possibly undefined. The lib
  // Subpath is the same runtime module with the interface exported, and the priority wins the duplicate
  imports: [{ as: "useVRules", from: "vuetify/lib/composables/rules/index.js", name: "useRules", priority: 2 }],
  transform: {
    // https://github.com/rolldown/rolldown/issues/8172#issuecomment-3859313807
    exclude: [/\/vue-phaserjs\//u],
  },
};
