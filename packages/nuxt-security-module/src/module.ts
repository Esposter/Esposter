// Nuxt's `nitro` option is declared by its Nitro builder's augmentation.
// A module outside a Nuxt app does not load that augmentation.
/// <reference types="@nuxt/nitro-server" />
import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { SecurityRouteRules } from "#src/models/SecurityRouteRules";
import type { NuxtModule } from "@nuxt/schema";

import { MODULE_NAME } from "#src/runtime/constants";
import { checkIsRecord } from "#src/runtime/services/checkIsRecord";
import { computeSubresourceIntegrityHashes } from "#src/services/computeSubresourceIntegrityHashes";
import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { getPluginTemplate } from "#src/services/getPluginTemplate";
import { getRouteRulesTemplate } from "#src/services/getRouteRulesTemplate";
import { getRouteSecurityRules } from "#src/services/getRouteSecurityRules";
import { getStaticResourceHeaders } from "#src/services/getStaticResourceHeaders";
import { getTypeTemplate } from "#src/services/getTypeTemplate";
import { mergeModuleOptions } from "#src/services/mergeModuleOptions";
import { parseModuleOptions } from "#src/services/parseModuleOptions";
import {
  addNitroPlugin,
  addServerHandler,
  addServerTemplate,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import { defu } from "defu";

export type { ModuleOptions } from "#src/models/ModuleOptions";

declare module "@nuxt/schema" {
  interface NuxtConfig {
    security?: Partial<ModuleOptions>;
  }
}

// A route rule's `security` key, which the module reads when the rules are resolved at build time
declare module "nitro/types" {
  interface RouteRuleConfig {
    security?: SecurityRouteRules;
  }
}

const ROUTE_RULES_TEMPLATE_FILENAME = `#${MODULE_NAME}/route-rules.mjs`;
const SRI_HASHES_TEMPLATE_FILENAME = `#${MODULE_NAME}/sri-hashes.mjs`;
const ROUTE_RULES_PLUGIN_FILENAME = `#${MODULE_NAME}/route-rules-plugin.mjs`;
const SRI_PLUGIN_FILENAME = `#${MODULE_NAME}/sri-plugin.mjs`;

const securityModule: NuxtModule<Partial<ModuleOptions>> = defineNuxtModule<Partial<ModuleOptions>>({
  meta: { compatibility: { nuxt: ">=5.0.0-0" }, configKey: "security", name: MODULE_NAME },
  setup(userOptions, nuxt) {
    const options = parseModuleOptions(
      mergeModuleOptions(
        getDefaultModuleOptions(nuxt.options.dev, nuxt.options.devServer.url, userOptions.strict === true),
        userOptions,
      ),
    );
    if (!options.enabled) return;

    const resolver = createResolver(import.meta.url);
    const { basicAuth, ...publicOptions } = options;

    // The credentials stay on the server, and the route rules every request matches are the options without them
    const { private: privateRuntimeConfig } = nuxt.options.runtimeConfig;
    nuxt.options.runtimeConfig.private = defu(checkIsRecord(privateRuntimeConfig) ? privateRuntimeConfig : {}, {
      basicAuth,
    });
    // Validated here, at build time, so a bad route rule stops the build before any request is served
    const routeSecurityRules = getRouteSecurityRules(nuxt.options.routeRules ?? {}, options);
    addServerTemplate({
      filename: ROUTE_RULES_TEMPLATE_FILENAME,
      getContents: () => getRouteRulesTemplate({ "/**": publicOptions, ...routeSecurityRules }),
    });
    addServerTemplate({
      filename: ROUTE_RULES_PLUGIN_FILENAME,
      getContents: () =>
        getPluginTemplate(
          resolver.resolve("./runtime/nitro/plugins/routeRules"),
          "createRouteRulesPlugin",
          ROUTE_RULES_TEMPLATE_FILENAME,
        ),
    });
    addNitroPlugin(ROUTE_RULES_PLUGIN_FILENAME);

    if (options.headers)
      nuxt.options.routeRules = defu(
        { "/**": { headers: getStaticResourceHeaders(options.headers) } },
        nuxt.options.routeRules,
      );

    // Each feature registers its plugin or handler only when it is on, so a disabled one costs nothing per request.
    // The nonce is registered before the headers, which read the nonce it writes on the same request hook
    if (options.nonce) addNitroPlugin(resolver.resolve("./runtime/nitro/plugins/nonce"));
    if (options.sri) {
      addServerTemplate({
        filename: SRI_PLUGIN_FILENAME,
        getContents: () =>
          getPluginTemplate(
            resolver.resolve("./runtime/nitro/plugins/subresourceIntegrity"),
            "createSubresourceIntegrityPlugin",
            SRI_HASHES_TEMPLATE_FILENAME,
          ),
      });
      addNitroPlugin(SRI_PLUGIN_FILENAME);
    }
    if (options.ssg) addNitroPlugin(resolver.resolve("./runtime/nitro/plugins/ssgHashes"));
    if (options.headers) addNitroPlugin(resolver.resolve("./runtime/nitro/plugins/securityHeaders"));
    if (options.hidePoweredBy) addNitroPlugin(resolver.resolve("./runtime/nitro/plugins/hidePoweredBy"));

    if (options.csrf)
      addServerHandler({ handler: resolver.resolve("./runtime/server/middleware/csrf"), middleware: true });

    if (options.rateLimiter)
      addServerHandler({ handler: resolver.resolve("./runtime/server/middleware/rateLimiter"), middleware: true });

    if (options.requestSizeLimiter)
      addServerHandler({
        handler: resolver.resolve("./runtime/server/middleware/requestSizeLimiter"),
        middleware: true,
      });

    if (options.corsHandler)
      addServerHandler({ handler: resolver.resolve("./runtime/server/middleware/corsHandler"), middleware: true });

    if (options.allowedMethodsRestricter)
      addServerHandler({
        handler: resolver.resolve("./runtime/server/middleware/allowedMethodsRestricter"),
        middleware: true,
      });

    if (basicAuth)
      addServerHandler({ handler: resolver.resolve("./runtime/server/middleware/basicAuth"), middleware: true });

    // The integrity hashes need the build's public assets, which exist only once Nitro is about to build them
    let sriHashes: Record<string, string> = {};
    if (options.sri) {
      addServerTemplate({
        filename: SRI_HASHES_TEMPLATE_FILENAME,
        getContents: () => `export default ${JSON.stringify(sriHashes)}\n`,
      });
      nuxt.hook("nitro:build:before", async (nitro) => {
        sriHashes = await computeSubresourceIntegrityHashes(nitro);
      });
    }

    addTypeTemplate(
      { filename: `types/${MODULE_NAME}.d.ts`, getContents: getTypeTemplate },
      { nitro: true, nuxt: true },
    );
  },
});

export default securityModule;
