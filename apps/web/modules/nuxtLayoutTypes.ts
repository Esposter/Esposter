import { join } from "node:path";
import { defineNuxtModule } from "nuxt/kit";

// @TODO: no upstream issue — nuxt/nuxt: `<NuxtLayout>` is typed with only `name` and `fallback`, though every other
// Attribute it is given reaches the layout as a prop, so its declaration is pointed at one typed from the layouts
export default defineNuxtModule({
  meta: { name: "nuxt-layout-types" },
  setup: (_options, nuxt) => {
    nuxt.hook("components:extend", (components) => {
      const nuxtLayout = components.find(({ pascalName }) => pascalName === "NuxtLayout");
      if (nuxtLayout) nuxtLayout.declarationPath = join(nuxt.options.srcDir, "types", "NuxtLayout.d.ts");
    });
  },
});
