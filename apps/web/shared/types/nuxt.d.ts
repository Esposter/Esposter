// @TODO: no upstream issue — the two declarations Nuxt's server project lacks, `import.meta.env` for code under
// `shared/` and the hook nuxt-security calls without declaring it on Nitro's, go once each package types its own
/// <reference types="nitro/types" />
import type { NuxtSecurityRouteRules } from "nuxt-security";

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module "nitro/types" {
  interface NitroRuntimeHooks {
    "nuxt-security:routeRules": (routeRules: Record<string, NuxtSecurityRouteRules>) => void;
  }
}
