import type { NuxtConfig } from "nuxt/schema";

// `compatibilityVersion: 5` defaults `optionsApi` off, which compiles Vue's Options API runtime out of the
// client. `applyOptions` then never runs for an Options API component, so `$data` stays empty and its render
// reads properties off `undefined` with nothing thrown beforehand to point at the cause. emoji-mart-vue-fast's
// `Picker.vue` is Options API, so the emoji picker dies on mount with `reading 'allCategories'` without it
export const vue: NuxtConfig["vue"] = {
  optionsApi: true,
};
