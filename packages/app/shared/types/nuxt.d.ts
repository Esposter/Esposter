// @TODO: Remove this file when nuxt fixes its types
/// <reference types="nitropack/types" />
import type { LogObject } from "consola";
import type { H3Event } from "h3";
import type { NuxtSecurityRouteRules } from "nuxt-security";
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
    pwa?: unknown;
    security?: unknown;
    site?: unknown;
    unocss?: unknown;
    vuetify?: unknown;
  }
}
