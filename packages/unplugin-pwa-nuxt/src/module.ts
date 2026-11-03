// Nuxt's `nitro` option is declared by its Nitro builder's augmentation.
// A module outside a Nuxt app does not load that augmentation.
/// <reference types="@nuxt/nitro-server" />
import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { PwaContext } from "#src/models/PwaContext";
import type { NuxtModule } from "@nuxt/schema";

import { MODULE_NAME } from "#src/runtime/constants";
import { buildServiceWorker } from "#src/services/buildServiceWorker";
import { configurePwaOptions } from "#src/services/configurePwaOptions";
import { getNitroNavigationDenylist } from "#src/services/getNitroNavigationDenylist";
import { getTypeTemplate } from "#src/services/getTypeTemplate";
import { getVitePlugins } from "#src/services/getVitePlugins";
import { addPluginTemplate, addTypeTemplate, addVitePlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import { createCustomVitePWAContext } from "@unplugin-pwa/vite/vite-context";

export type { ModuleOptions } from "#src/models/ModuleOptions";
export type { Pwa } from "#src/runtime/models/Pwa";

declare module "@nuxt/schema" {
  interface NuxtConfig {
    pwa?: ModuleOptions;
  }
}

const pwaModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  defaults: ({ options }) => ({ base: options.app.baseURL, scope: options.app.baseURL }),
  meta: { compatibility: { nuxt: ">=5.0.0-0" }, configKey: "pwa", name: MODULE_NAME },
  setup({ periodicSyncForUpdates, ...pwaOptions }, nuxt) {
    if (pwaOptions.disable) return;

    const resolver = createResolver(import.meta.url);
    const { baseURL } = nuxt.options.app;
    const { manifest, manifestFilename = "manifest.webmanifest", useCredentials } = pwaOptions;
    if (manifest) {
      const { head } = nuxt.options.app;
      head.link = [
        ...(head.link ?? []),
        {
          href: `${baseURL}${manifestFilename}`,
          rel: "manifest",
          ...(useCredentials && { crossorigin: "use-credentials" }),
        },
      ];
    }

    addPluginTemplate({
      filename: `${MODULE_NAME}.client.mjs`,
      getContents: () =>
        [
          "import { useRegisterSW } from 'virtual:pwa-register/vue'",
          `import { createPwaPlugin } from ${JSON.stringify(resolver.resolve("./runtime/createPwaPlugin"))}`,
          "",
          `export default createPwaPlugin(useRegisterSW, ${JSON.stringify(periodicSyncForUpdates)})`,
          "",
        ].join("\n"),
      mode: "client",
    });
    addTypeTemplate({ filename: `types/${MODULE_NAME}.d.ts`, getContents: getTypeTemplate });

    const context: PwaContext = createCustomVitePWAContext("vite", true, { ...pwaOptions, injectRegister: false });
    addVitePlugin(() => getVitePlugins(context), { server: false });
    // Nitro is what knows where the app is served from and which routes the server answers, and it exists before the
    // Bundler resolves a Vite config, which is when the engine asks for what is Nuxt's to say
    nuxt.hook("nitro:init", (nitro) => {
      context.configurePWAOptions = () =>
        Promise.resolve(
          configurePwaOptions(context, nuxt, nitro.options.output.publicDir, () => getNitroNavigationDenylist(nitro)),
        );
      nuxt.hook("nitro:build:public-assets", () => buildServiceWorker(context, nuxt, nitro));
    });
  },
});

export default pwaModule;
