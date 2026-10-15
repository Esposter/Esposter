import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { NuxtModule } from "@nuxt/schema";

import { checkIsTresCustomElement } from "#src/services/checkIsTresCustomElement";
import { CORE_PACKAGE_NAME, GLSL_PACKAGE_NAME, THREE_PACKAGE_NAME, TRES_CANVAS_NAME } from "#src/services/constants";
import { getExportNames } from "#src/services/getExportNames";
import { getTresPackageNames } from "#src/services/getTresPackageNames";
import { addComponent, addImports, addVitePlugin, createResolver, defineNuxtModule, resolvePath } from "@nuxt/kit";
import { defu } from "defu";

export type { ModuleOptions } from "#src/models/ModuleOptions";

const LOWERCASE_NAME_REGEX = /^[a-z]/u;

const tresjsModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  defaults: { glsl: false, modules: [] },
  meta: { compatibility: { nuxt: ">=5.0.0-0" }, configKey: "tres", name: "tresjs-nuxt" },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    nuxt.options.build.transpile.push(/@tresjs\//u);
    nuxt.options.vue.compilerOptions.isCustomElement = checkIsTresCustomElement;
    const coreExportNames = await getExportNames(await resolvePath(CORE_PACKAGE_NAME));
    addImports([
      ...coreExportNames.filter((name) => name.startsWith("use")).map((name) => ({ from: CORE_PACKAGE_NAME, name })),
      { as: "extendTres", from: CORE_PACKAGE_NAME, name: "extend" },
      { from: CORE_PACKAGE_NAME, name: "TresObject", type: true },
    ]);
    nuxt.hook("prepare:types", ({ references }) => {
      references.push({ types: CORE_PACKAGE_NAME });
    });
    const packageNames = new Set([...(options.modules ?? []), ...(await getTresPackageNames(nuxt.options.rootDir))]);
    const packageExports = await Promise.all(
      Array.from(packageNames, async (packageName) => {
        const entryPath = await resolvePath(packageName);
        if (entryPath === packageName) return [];
        return (await getExportNames(entryPath)).map((name) => ({ name, packageName }));
      }),
    );
    for (const { name, packageName } of packageExports.flat())
      if (LOWERCASE_NAME_REGEX.test(name)) addImports({ from: packageName, name });
      else addComponent({ export: name, filePath: packageName, name });

    nuxt.options.vite.resolve = defu(nuxt.options.vite.resolve, { dedupe: [THREE_PACKAGE_NAME] });
    nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, { include: [THREE_PACKAGE_NAME] });
    addComponent({ filePath: await resolvePath(resolve("./runtime/TresCanvas.client")), name: TRES_CANVAS_NAME });
    addComponent({ filePath: await resolvePath(resolve("./runtime/TresCanvas.server")), name: TRES_CANVAS_NAME });
    if (options.glsl) {
      // The plugin is an optional peer, so it is loaded only when enabled: a static import would fail every consumer that leaves it out
      // eslint-disable-next-line no-restricted-syntax -- an optional peer, loaded only when the option asks for it
      const { default: glsl } = await import(GLSL_PACKAGE_NAME);
      addVitePlugin(glsl());
    }
  },
});

export default tresjsModule;
