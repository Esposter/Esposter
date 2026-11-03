import type { NuxtModule } from "@nuxt/schema";

import { defineNuxtModule } from "@nuxt/kit";

export interface ModuleOptions {}

// Typed by annotation, since isolatedDeclarations cannot infer a default export's type from a call
const pwaModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: { configKey: "pwa", name: "pwa" },
  setup() {},
});

export default pwaModule;
