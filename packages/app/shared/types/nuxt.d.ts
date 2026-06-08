// @TODO: Remove this file when nuxt fixes its types
/// <reference types="nitropack/types" />
import type { ModuleOptions as SitemapModuleOptions } from "@nuxtjs/sitemap";
import type { UnocssNuxtOptions } from "@unocss/nuxt";
import type { PwaModuleOptions } from "@vite-pwa/nuxt";
import type { LogObject } from "consola";
import type { H3Event } from "h3";
import type { ModuleOptions as OgImageModuleOptions } from "nuxt-og-image";
import type { ModuleOptions as SchemaOrgModuleOptions } from "nuxt-schema-org";
import type { NuxtSecurityRouteRules, ModuleOptions as SecurityModuleOptions } from "nuxt-security";
import type { ModuleOptions as SiteModuleOptions } from "nuxt-site-config";
import type { NuxtIslandContext, NuxtIslandResponse, NuxtRenderHTMLContext } from "nuxt/app";
import type { DefineNuxtConfig } from "nuxt/config";

import "nuxt/schema";
import type { RuntimeConfig, SchemaDefinition } from "nuxt/schema";
import type { VuetifyModuleOptions } from "vuetify-nuxt-module";

declare global {
  const defineNuxtConfig: DefineNuxtConfig;
  const defineNuxtSchema: (schema: SchemaDefinition) => SchemaDefinition;

  interface ImportMeta {
    readonly env: ImportMetaEnv;
    url: string;
  }
}

// Note: Keep in sync with packages/nuxt/src/core/templates.ts
declare module "nitropack" {
  interface NitroRouteConfig {
    /** @deprecated Use `noScripts` instead */
    experimentalNoScripts?: boolean;
    noScripts?: boolean;
    ssr?: boolean;
  }
  interface NitroRuntimeConfig extends RuntimeConfig {}
  interface NitroRuntimeHooks {
    "dev:ssr-logs": (ctx: { logs: LogObject[]; path: string }) => Promise<void> | void;
    "render:html": (htmlContext: NuxtRenderHTMLContext, context: { event: H3Event }) => Promise<void> | void;
    "render:island": (
      islandResponse: NuxtIslandResponse,
      context: { event: H3Event; islandContext: NuxtIslandContext },
    ) => Promise<void> | void;
  }
}
declare module "nitropack/types" {
  interface NitroRouteConfig {
    /** @deprecated Use `noScripts` instead */
    experimentalNoScripts?: boolean;
    noScripts?: boolean;
    ssr?: boolean;
  }
  interface NitroRuntimeConfig extends RuntimeConfig {}
  interface NitroRuntimeHooks {
    "dev:ssr-logs": (ctx: { logs: LogObject[]; path: string }) => Promise<void> | void;
    "nuxt-security:routeRules": (routeRules: Record<string, NuxtSecurityRouteRules>) => void;
    "render:html": (htmlContext: NuxtRenderHTMLContext, context: { event: H3Event }) => Promise<void> | void;
    "render:island": (
      islandResponse: NuxtIslandResponse,
      context: { event: H3Event; islandContext: NuxtIslandContext },
    ) => Promise<void> | void;
    "vuetify:configuration": (options: {
      isDev: boolean;
      vuetifyOptions: VuetifyModuleOptions["vuetifyOptions"];
    }) => void;
  }
}

declare module "nuxt/schema" {
  interface NuxtConfig {
    ogImage?: Partial<OgImageModuleOptions>;
    pwa?: PwaModuleOptions;
    schemaOrg?: Partial<SchemaOrgModuleOptions>;
    security?: Partial<SecurityModuleOptions>;
    site?: Partial<SiteModuleOptions>;
    sitemap?: Partial<SitemapModuleOptions>;
    unocss?: UnocssNuxtOptions;
    vuetify?: VuetifyModuleOptions;
  }
}
