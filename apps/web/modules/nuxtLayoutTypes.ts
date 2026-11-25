import { join } from "node:path";
import { defineNuxtModule } from "nuxt/kit";

// @TODO: https://github.com/nuxt/nuxt/issues/37267 — `<NuxtLayout>` is typed with only `name` and `fallback`, though
// Every other attribute it is given reaches the layout as a prop, so its declaration is pointed at one typed from the
// Layouts
export default defineNuxtModule({
  meta: { name: "nuxt-layout-types" },
  setup: (_options, nuxt) => {
    nuxt.hook("components:extend", (components) => {
      const nuxtLayout = components.find(({ pascalName }) => pascalName === "NuxtLayout");
      if (nuxtLayout) nuxtLayout.declarationPath = join(nuxt.options.srcDir, "types", "NuxtLayout.d.ts");
    });
  },
});
